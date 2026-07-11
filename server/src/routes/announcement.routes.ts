import { Router } from 'express';
import { getAnnouncements } from '../controllers/announcementController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/announcements', protect, authorizeRoles('author', 'reviewer', 'admin'), getAnnouncements);

export default router;
