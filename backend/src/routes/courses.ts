// backend/src/routes/courses.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Course } from '../entity/Course';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Get all courses
router.get('/', async (req: Request, res: Response) => {
  try {
    const courseRepo = AppDataSource.getRepository(Course);
    const courses = await courseRepo.find({
      where: { is_active: true },
      order: { code: 'ASC' }
    });

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

// Get course by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const courseRepo = AppDataSource.getRepository(Course);
    const course = await courseRepo.findOne({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course'
    });
  }
});

// Create new course (admin only)
router.post('/', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { code, name, semester, year } = req.body;

    if (!code || !name || !semester || !year) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const courseRepo = AppDataSource.getRepository(Course);
    
    // Check if course code already exists
    const existingCourse = await courseRepo.findOne({ where: { code } });
    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: 'Course with this code already exists'
      });
    }

    const course = courseRepo.create({
      code,
      name,
      semester,
      year: parseInt(year)
    });

    const savedCourse = await courseRepo.save(course);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: savedCourse
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course'
    });
  }
});

export default router;