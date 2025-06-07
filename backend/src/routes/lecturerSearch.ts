import { Router } from 'express';
import { LectureSearchController } from '../controllers/LectureSearchContoller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Unified lecturer search endpoint (POST)
router.post(
  '/search',
  requireAuth,
  requireRole('lecturer'),
  LectureSearchController.searchLecturerCandidates
);

export default router;