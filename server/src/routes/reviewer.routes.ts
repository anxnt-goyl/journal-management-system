import { Router } from 'express';
import { getAssignedPapers, getReviewerDashboard } from '../controllers/reviewerController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/reviewer/papers', protect, authorizeRoles('reviewer'), getAssignedPapers);
router.get('/dashboard/reviewer', protect, authorizeRoles('reviewer'), getReviewerDashboard);

export default router;
