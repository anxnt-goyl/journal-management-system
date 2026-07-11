import { Router } from 'express';
import { getIssues } from '../controllers/issueController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/issues', protect, authorizeRoles('author', 'reviewer', 'admin'), getIssues);

export default router;
