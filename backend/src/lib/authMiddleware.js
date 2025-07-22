import { getSession } from "@auth/express";
import { authConfig } from '../auth.js';

// Logger middleware for development mode
export const routeLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip;
    const userAgent = req.get('user-agent') || 'Unknown';
    
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - ${userAgent}`);
  }
  next();
};

// Middleware to protect routes (require authentication)
export const requireAuth = async (req, res, next) => {
  try {
    const session = await getSession(req, authConfig);
    
    if (!session?.user) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔒 Authentication required for ${req.method} ${req.originalUrl}`);
      }
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        redirectUrl: '/auth/signin'
      });
    }
    req.session = session;
    req.user = session.user;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Authenticated access: ${req.user.email} - ${req.method} ${req.originalUrl}`);
    }
    
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication verification failed'
    });
  }
};
