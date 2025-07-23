import express from 'express';
import { registerUser } from '../controllers/auth.Controller.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration attempts per hour
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again later.'
  }
});

// Registration endpoint
router.post('/register', registerLimiter, registerUser);

// Login endpoint (handled by Auth.js)
router.get('/signin', (req, res) => {
  res.json({
    success: true,
    message: 'Use POST /auth/callback/credentials to login',
    endpoints: {
      login: 'POST /auth/callback/credentials',
      logout: 'POST /auth/signout',
      session: 'GET /auth/session'
    }
  });
});

export default router;
