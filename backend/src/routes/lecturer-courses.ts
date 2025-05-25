// backend/src/routes/lecturer-courses.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Lecturer } from '../entity/Lecturer';
import { Course } from '../entity/Course';
import { User } from '../entity/User';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Get courses for a specific lecturer
router.get('/lecturer/:lecturerId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { lecturerId } = req.params;
    
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const lecturer = await lecturerRepo.findOne({
      where: { id: lecturerId },
      relations: ['courses']
    });

    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found'
      });
    }

    res.json({
      success: true,
      courses: lecturer.courses
    });

  } catch (error) {
    console.error('Error fetching lecturer courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

// Get current user's courses (if lecturer)
router.get('/my-courses', requireAuth, requireRole('lecturer'), async (req: Request, res: Response) => {
  try {
    console.log('Getting courses for lecturer:', req.session.userId);
    
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: req.session.userId },
      relations: ['lecturer', 'lecturer.courses']
    });

    console.log('Found user:', user ? 'Yes' : 'No');
    console.log('Has lecturer profile:', user?.lecturer ? 'Yes' : 'No');

    if (!user || !user.lecturer) {
      console.log('Lecturer profile not found for user:', req.session.userId);
      return res.status(404).json({
        success: false,
        message: 'Lecturer profile not found'
      });
    }

    console.log('Lecturer courses count:', user.lecturer.courses?.length || 0);

    res.json({
      success: true,
      courses: user.lecturer.courses || []
    });

  } catch (error) {
    console.error('Error fetching my courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Assign lecturer to course (allow lecturers to assign themselves for testing)
router.post('/add', requireAuth, requireRole('lecturer'), async (req: Request, res: Response) => {
  try {
    let { lecturer_id, course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // If lecturer_id is 'current' or not provided, use current user's lecturer ID
    if (!lecturer_id || lecturer_id === 'current') {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: req.session.userId },
        relations: ['lecturer']
      });

      if (!user || !user.lecturer) {
        return res.status(404).json({
          success: false,
          message: 'Lecturer profile not found'
        });
      }

      lecturer_id = user.lecturer.id;
    }

    // Get lecturer
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const lecturer = await lecturerRepo.findOne({
      where: { id: lecturer_id },
      relations: ['courses']
    });

    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found'
      });
    }

    // Get course
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
        message: 'You are already assigned to this course'
      });
    }

    // Add course to lecturer
    lecturer.courses.push(course);
    await lecturerRepo.save(lecturer);

    res.json({
      success: true,
      message: 'Course assigned successfully'
    });

  } catch (error) {
    console.error('Error assigning lecturer to course:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning course'
    });
  }
});

// Remove lecturer from course
router.post('/remove', requireAuth, requireRole('lecturer'), async (req: Request, res: Response) => {
  try {
    let { lecturer_id, course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // If lecturer_id is 'current' or not provided, use current user's lecturer ID
    if (!lecturer_id || lecturer_id === 'current') {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: req.session.userId },
        relations: ['lecturer']
      });

      if (!user || !user.lecturer) {
        return res.status(404).json({
          success: false,
          message: 'Lecturer profile not found'
        });
      }

      lecturer_id = user.lecturer.id;
    }

    // Get lecturer
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const lecturer = await lecturerRepo.findOne({
      where: { id: lecturer_id },
      relations: ['courses']
    });

    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found'
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
    console.error('Error removing lecturer from course:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing course'
    });
  }
});

// Auto-assign current lecturer to some courses (for testing purposes)
router.post('/auto-assign', requireAuth, requireRole('lecturer'), async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: req.session.userId },
      relations: ['lecturer', 'lecturer.courses']
    });

    if (!user || !user.lecturer) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer profile not found'
      });
    }

    // Get some courses to assign (first 3 courses)
    const courseRepo = AppDataSource.getRepository(Course);
    const courses = await courseRepo.find({
      take: 3,
      where: { is_active: true }
    });

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No courses available'
      });
    }

    // Assign courses to lecturer
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const lecturer = await lecturerRepo.findOne({
      where: { id: user.lecturer.id },
      relations: ['courses']
    });

    if (lecturer) {
      // Only add courses that aren't already assigned
      for (const course of courses) {
        const isAlreadyAssigned = lecturer.courses.some(c => c.id === course.id);
        if (!isAlreadyAssigned) {
          lecturer.courses.push(course);
        }
      }
      
      await lecturerRepo.save(lecturer);
    }

    res.json({
      success: true,
      message: `Auto-assigned to ${courses.length} courses`,
      courses: courses.map(c => ({ id: c.id, code: c.code, name: c.name }))
    });

  } catch (error) {
    console.error('Error auto-assigning courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error auto-assigning courses'
    });
  }
});

export default router;