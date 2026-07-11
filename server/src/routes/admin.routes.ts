import { Router } from 'express';
import { getUsers, getAdminDashboard, assignReviewer, publishPaper } from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/users', protect, authorizeRoles('admin'), getUsers);
router.post('/admin/reviewer-assignments', protect, authorizeRoles('admin'), assignReviewer);
router.patch('/admin/papers/:paperId/publish', protect, authorizeRoles('admin'), publishPaper);
router.get('/dashboard/admin', protect, authorizeRoles('admin'), getAdminDashboard);

export default router;
