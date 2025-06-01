// backend/src/routes/applications.ts
import { Router } from 'express';
import { ApplicationController } from '../controllers/ApplicationController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Candidate routes
router.post('/submit', requireAuth, requireRole('candidate'), ApplicationController.submitApplication);
router.get('/my-applications', requireAuth, requireRole('candidate'), ApplicationController.getCandidateApplications);

// Lecturer routes
router.get('/for-review', requireAuth, requireRole('lecturer'), ApplicationController.getApplicationsForReview);
router.put('/:id/status', requireAuth, requireRole('lecturer'), ApplicationController.updateApplicationStatus);
router.post('/:id/comment', requireAuth, requireRole('lecturer'), ApplicationController.addComment);
router.put('/:id/ranking', requireAuth, requireRole('lecturer'), ApplicationController.updateRanking);

export default router;