import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import { routeLogger } from "./middleware/auth.middleware.js";
import authRoutes from "./routes/auth.route.js";
import protectedRoutes from "./routes/protected.route.js";
import expressAuth from "./auth.js";
import messageRoutes from "./routes/message.route.js";
import http from "http";
import { setupSocket } from "./lib/socket.js";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
setupSocket(server);

// HTTP to HTTPS redirect middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && !req.secure && req.headers["x-forwarded-proto"] !== "https") {
    // Redirect to HTTPS
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  next();
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Trust proxy for proper IP detection behind reverse proxies
app.set("trust proxy", process.env.NODE_ENV === "production");

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://realtime-chat-coral-eight.vercel.app"]
        : ["http://localhost:3000", "http://localhost:3001", "https://realtime-chat-coral-eight.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// Route logger for development mode
app.use(routeLogger);

// Auth.js routes - handles /auth/signin, /auth/signout, /auth/session, etc.
app.use("/auth", expressAuth);

// Custom authentication routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/user", protectedRoutes);

// Message routes
app.use("/api/message", messageRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    session: res.locals.session ? "Active" : "None",
  });
});

// 404 handler
app.use("/*catchall", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
});

// Graceful shutdown by contanier like docker or render/vercel
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});
// Graceful shutdown by ctrl+c or kill command
process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});


connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`
🚀 Server running on port ${PORT}
📊 Environment: ${process.env.NODE_ENV}
🔗 Health check: http://localhost:${PORT}/health
🔐 Auth endpoints: http://localhost:${PORT}/auth/*
📱 API endpoints: http://localhost:${PORT}/api/*
  `);
  });
});

export default app;
