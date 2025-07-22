import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/authController.js';
import { requireAuth } from '../lib/authMiddleware.js';

const router = express.Router();


// User profile routes
router.get('/profile', requireAuth, getUserProfile);
router.put('/profile', requireAuth, updateUserProfile);

// Protected dashboard
router.get('/dashboard', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to your dashboard',
    user: req.user,
    session: req.session
  });
});

export default router;
