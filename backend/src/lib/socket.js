import { Server } from "socket.io";

// used to store online users
const userSocketMap = {}; // {userId: socketId}
let io;

export function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001","https://realtime-chat-coral-eight.vercel.app"],
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    },
  });

  // Authentication middleware that pass from frontend socket.io
  io.use((socket, next) => {
    const userId = socket.handshake.query.userId;
    if (!userId) return next(new Error("Authentication required"));
    next();
  });


  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      if (userId) delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export { io };
