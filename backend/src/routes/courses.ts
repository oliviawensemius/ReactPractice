// backend/src/routes/courses.ts
import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', CourseController.getAllCourses);
router.get('/:id', CourseController.getCourseById);

// Admin only routes
router.post('/', requireAuth, requireRole('admin'), CourseController.createCourse);
router.put('/:id', requireAuth, requireRole('admin'), CourseController.updateCourse);
router.delete('/:id', requireAuth, requireRole('admin'), CourseController.deleteCourse);

export default router;