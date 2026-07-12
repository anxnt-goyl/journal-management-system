import { Router } from 'express';
import { getPapers, searchPapers, createPaper, createRevision, getAuthorDashboard, getPublishedPapers, getMyPapers } from '../controllers/paperController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { uploadPaperFile } from '../middleware/uploadMiddleware';

const router = Router();

// Public: safe for the landing page / search — only published papers, no auth required
router.get('/papers/published', getPublishedPapers);

// The logged-in author's own submissions ONLY (fixes "my papers" showing everyone's papers)
router.get('/papers/mine', protect, authorizeRoles('author'), getMyPapers);

router.get('/papers', protect, authorizeRoles('author', 'reviewer', 'admin'), getPapers);
router.get('/papers/search', protect, authorizeRoles('author', 'reviewer', 'admin'), searchPapers);
router.post('/papers', protect, authorizeRoles('author', 'admin'), uploadPaperFile, createPaper);
router.post('/papers/:paperId/revise', protect, authorizeRoles('author', 'admin'), uploadPaperFile, createRevision);
router.get('/dashboard/author', protect, authorizeRoles('author'), getAuthorDashboard);

export default router;
