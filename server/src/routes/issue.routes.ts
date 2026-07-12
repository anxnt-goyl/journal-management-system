import { Router } from 'express';
import { getIssues, createIssue, publishIssue } from '../controllers/issueController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/issues', getIssues);
router.post('/issues', protect, authorizeRoles('admin'), createIssue);
router.patch('/issues/:issueId/publish', protect, authorizeRoles('admin'), publishIssue);

export default router;
