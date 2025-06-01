// backend/src/routes/lecturer-courses.ts
import { Router } from 'express';
import { LecturerController } from '../controllers/LecturerController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Lecturer course management routes
router.get('/my-courses', requireAuth, requireRole('lecturer'), LecturerController.getMyCourses);
router.post('/add', requireAuth, requireRole('lecturer'), LecturerController.addCourse);
router.post('/remove', requireAuth, requireRole('lecturer'), LecturerController.removeCourse);

export default router;