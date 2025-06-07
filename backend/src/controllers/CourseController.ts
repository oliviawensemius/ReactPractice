// backend/src/controllers/CourseController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Course } from '../entity/Course';
import { validateCourse } from '../utils/validation';

export class CourseController {

  // Get all courses
  static async getAllCourses(req: Request, res: Response): Promise<Response> {
    try {
      const courseRepo = AppDataSource.getRepository(Course);
      const courses = await courseRepo.find({
        where: { is_active: true },
        order: { code: 'ASC' }
      });

       return res.json({
        success: true,
        courses
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching courses'
      });
    }
  }

  // Get course by ID
  static async getCourseById(req: Request, res: Response): Promise<Response> {
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

      return res.json({
        success: true,
        course
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching course'
      });
    }
  }

  // Create new course (admin only)
  static async createCourse(req: Request, res: Response): Promise<Response> {
    try {
      const { code, name, semester, year } = req.body;

      // Validate course data
      const courseValidation = validateCourse(code, name);
      if (!courseValidation.valid) {
        return res.status(400).json({
          success: false,
          message: courseValidation.message
        });
      }

      if (!semester || !year) {
        return res.status(400).json({
          success: false,
          message: 'Semester and year are required'
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

      return res.status(201).json({
        success: true,
        message: 'Course created successfully',
        course: savedCourse
      });
    } catch (error) {
      console.error('Error creating course:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating course'
      });
    }
  }

  // Update course (admin only)
  static async updateCourse(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { code, name, semester, year, is_active } = req.body;

      const courseRepo = AppDataSource.getRepository(Course);
      const course = await courseRepo.findOne({ where: { id } });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Validate course data if provided
      if (code && name) {
        const courseValidation = validateCourse(code, name);
        if (!courseValidation.valid) {
          return res.status(400).json({
            success: false,
            message: courseValidation.message
          });
        }
      }

      // Update course fields
      if (code) course.code = code;
      if (name) course.name = name;
      if (semester) course.semester = semester;
      if (year) course.year = parseInt(year);
      if (is_active !== undefined) course.is_active = is_active;

      const updatedCourse = await courseRepo.save(course);

      return res.json({
        success: true,
        message: 'Course updated successfully',
        course: updatedCourse
      });
    } catch (error) {
      console.error('Error updating course:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating course'
      });
    }
  }

  // Delete course (admin only)
  static async deleteCourse(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const courseRepo = AppDataSource.getRepository(Course);
      
      const course = await courseRepo.findOne({ where: { id } });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Soft delete by setting is_active to false
      course.is_active = false;
      await courseRepo.save(course);

      return res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting course'
      });
    }
  }
}