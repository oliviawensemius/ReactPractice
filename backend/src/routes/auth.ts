// backend/src/routes/auth.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Authentication routes
router.post('/signup', AuthController.signup);
router.post('/signin', AuthController.signin);
router.post('/logout', AuthController.logout);
router.get('/profile', requireAuth, AuthController.getProfile);
router.get('/check', AuthController.checkAuth);

export default router;