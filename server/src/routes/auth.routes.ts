import { Router } from 'express';
import { login, logout, register, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { uploadAvatarFile } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/auth/register', uploadAvatarFile, register);
router.post('/auth/login', login);
router.post('/auth/logout', protect, logout);
router.get('/auth/me', protect, getMe);

export default router;
