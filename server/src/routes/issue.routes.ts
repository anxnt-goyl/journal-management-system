import { Router } from 'express';
import { getIssues } from '../controllers/issueController';

const router = Router();

router.get('/issues', getIssues);

export default router;
