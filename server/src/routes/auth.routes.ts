import { Router } from 'express';
import { login, logout, register } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', protect, logout);

export default router;
