// routes/auth.routes.js
import express from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller.js';
import isAuthenticated from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', isAuthenticated, logout);
router.get('/me', isAuthenticated, getMe);

export default router;