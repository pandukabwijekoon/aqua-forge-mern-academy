import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

// Secure routes
router.get('/me', protect, getMe);

export default router;
