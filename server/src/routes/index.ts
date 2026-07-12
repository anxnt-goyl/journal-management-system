import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';
import authRoutes from './auth.routes';
import paperRoutes from './paper.routes';
import reviewerRoutes from './reviewer.routes';
import reviewRoutes from './review.routes';
import adminRoutes from './admin.routes';
import issueRoutes from './issue.routes';
import announcementRoutes from './announcement.routes';
import notificationRoutes from './notification.routes';
import statsRoutes from './stats.routes';

const router = Router();

router.get('/health', healthCheck);

router.use(authRoutes);
router.use(paperRoutes);
router.use(reviewerRoutes);
router.use(reviewRoutes);
router.use(adminRoutes);
router.use(issueRoutes);
router.use(announcementRoutes);
router.use(notificationRoutes);
router.use(statsRoutes);

export default router;
