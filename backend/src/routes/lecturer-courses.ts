// backend/src/routes/lecturer-courses.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Course } from '../entity/Course';
import { Lecturer } from '../entity/Lecturer';
import { User } from '../entity/User';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Get courses for the current lecturer
router.get('/my-courses', requireAuth, requireRole('lecturer'), async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find the lecturer record
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const lecturer = await lecturerRepo.findOne({
      where: { user_id: userId },
      relations: ['courses']
    });

    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer profile not found'
      });
    }

    // Return the courses
    res.json({
      success: true,
      courses: lecturer.courses || []
    });

  } catch (error) {
    console.error('Error fetching lecturer courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

// Add course to lecturer
router.post('/add', requireAuth, requireRole('lecturer'), async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { course_id } = req.body;

    if (!userId || !course_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID and course ID are required'
      });
    }

    // Find the lecturer
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const lecturer = await lecturerRepo.findOne({
      where: { user_id: userId },
      relations: ['courses']
    });

    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer profile not found'
      });
    }

    // Find the course
    const courseRepo = AppDataSource.getRepository(Course);
    const course = await courseRepo.findOne({
      where: { id: course_id }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already assigned
    const isAlreadyAssigned = lecturer.courses.some(c => c.id === course_id);
    if (isAlreadyAssigned) {
      return res.status(409).json({
        success: false,
        message: 'Course already assigned to lecturer'
      });
    }

    // Add course to lecturer
    lecturer.courses.push(course);
    await lecturerRepo.save(lecturer);

    res.json({
      success: true,
      message: 'Course added successfully',
      course
    });

  } catch (error) {
    console.error('Error adding course to lecturer:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding course'
    });
  }
});

// Remove course from lecturer
router.post('/remove', requireAuth, requireRole('lecturer'), async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { course_id } = req.body;

    if (!userId || !course_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID and course ID are required'
      });
    }

    // Find the lecturer
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const lecturer = await lecturerRepo.findOne({
      where: { user_id: userId },
      relations: ['courses']
    });

    if (!lecturer) {
      return res.status(404).json({
        success: false,  
        message: 'Lecturer profile not found'
      });
    }

    // Remove course from lecturer
    lecturer.courses = lecturer.courses.filter(course => course.id !== course_id);
    await lecturerRepo.save(lecturer);

    res.json({
      success: true,
      message: 'Course removed successfully'
    });

  } catch (error) {
    console.error('Error removing course from lecturer:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing course'
    });
  }
});

export default router;