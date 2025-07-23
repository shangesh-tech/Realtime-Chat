import { ExpressAuth } from "@auth/express";
import Credentials from "@auth/express/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/db.js";
import User from "./models/user.model.js";
import { connectDB } from "./lib/db.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

await connectDB();

// Custom CSRF handler to avoid redirect loops
export const generateCsrfToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const authConfig = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "Enter your email address"
        },
        password: { 
          label: "Password", 
          type: "password",
          placeholder: "Enter your password"
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // No need to reconnect, just check if we need to wait for the connection
          if (!mongoose.connection.readyState) {
            console.log("Waiting for existing MongoDB connection...");
            await mongoose.connection.asPromise();
          }

          // Find user by email
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            throw new Error("No user found with this email address");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return user object (password will be excluded by toJSON method)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };

        } catch (error) {
          console.error("Authentication error:", error.message);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  callbacks: {
    async jwt({ token, user }) {
      // Include user info in JWT token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Include token info in session
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signIn({ user }) {
      console.log(`User ${user.email} signed in successfully`);
    },
    async signOut({ session, token }) {
      console.log(`User signed out: ${session?.user?.email || token?.email}`);
    },
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  // Force HTTPS for all Auth.js URLs
  baseUrl: "https://realtime-chat-qa08.onrender.com",
  // Remove the url parameter as it might be causing the redirect loop
  cookies: {
    // Prevent CSRF issues by setting secure cookies
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true
      }
    },
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true
      }
    }
  }
};

// Export the configured ExpressAuth function
export default ExpressAuth(authConfig);
