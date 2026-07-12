import { Router } from 'express';
import { getAnnouncements } from '../controllers/announcementController';

const router = Router();

router.get('/announcements', getAnnouncements);

export default router;
