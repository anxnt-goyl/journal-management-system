import { Router } from 'express';
import { getPapers, searchPapers, createPaper, createRevision, getAuthorDashboard } from '../controllers/paperController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { uploadPaperFile } from '../middleware/uploadMiddleware';

const router = Router();

router.get('/papers', protect, authorizeRoles('author', 'reviewer', 'admin'), getPapers);
router.get('/papers/search', protect, authorizeRoles('author', 'reviewer', 'admin'), searchPapers);
router.post('/papers', protect, authorizeRoles('author', 'admin'), uploadPaperFile, createPaper);
router.post('/papers/:paperId/revise', protect, authorizeRoles('author', 'admin'), uploadPaperFile, createRevision);
router.get('/dashboard/author', protect, authorizeRoles('author'), getAuthorDashboard);

export default router;
