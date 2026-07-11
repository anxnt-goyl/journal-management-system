import { Router } from 'express';
import { submitReview } from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.post('/reviewer/reviews', protect, authorizeRoles('reviewer'), submitReview);

export default router;
