import { Router } from 'express';
import { getAnnouncements, createAnnouncement } from '../controllers/announcementController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/announcements', getAnnouncements);
router.post('/announcements', protect, authorizeRoles('admin'), createAnnouncement);

export default router;
