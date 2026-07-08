import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';
import { login, logout, register } from '../controllers/authController';
import { assignReviewer, createPaper, createRevision, getAdminDashboard, getAnnouncements, getAssignedPapers, getAuthorDashboard, getIssues, getNotifications, getPapers, getReviewerDashboard, getUsers, markNotificationRead, publishPaper, searchPapers, submitReview } from '../controllers/contentController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { uploadPaperFile } from '../middleware/uploadMiddleware';

const router = Router();

router.get('/health', healthCheck);
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', protect, logout);
router.get('/users', protect, authorizeRoles('admin'), getUsers);
router.get('/papers', protect, authorizeRoles('author', 'reviewer', 'admin'), getPapers);
router.get('/papers/search', protect, authorizeRoles('author', 'reviewer', 'admin'), searchPapers);
router.post('/papers', protect, authorizeRoles('author', 'admin'), uploadPaperFile, createPaper);
router.post('/papers/:paperId/revise', protect, authorizeRoles('author', 'admin'), uploadPaperFile, createRevision);
router.get('/reviewer/papers', protect, authorizeRoles('reviewer'), getAssignedPapers);
router.post('/reviewer/reviews', protect, authorizeRoles('reviewer'), submitReview);
router.post('/admin/reviewer-assignments', protect, authorizeRoles('admin'), assignReviewer);
router.patch('/admin/papers/:paperId/publish', protect, authorizeRoles('admin'), publishPaper);
router.get('/dashboard/admin', protect, authorizeRoles('admin'), getAdminDashboard);
router.get('/dashboard/author', protect, authorizeRoles('author'), getAuthorDashboard);
router.get('/dashboard/reviewer', protect, authorizeRoles('reviewer'), getReviewerDashboard);
router.get('/issues', protect, authorizeRoles('author', 'reviewer', 'admin'), getIssues);
router.get('/announcements', protect, authorizeRoles('author', 'reviewer', 'admin'), getAnnouncements);
router.get('/notifications', protect, getNotifications);
router.patch('/notifications/:notificationId/read', protect, markNotificationRead);

export default router;
