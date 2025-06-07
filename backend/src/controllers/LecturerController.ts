// backend/src/controllers/LecturerController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Course } from '../entity/Course';
import { Lecturer } from '../entity/Lecturer';
import { CandidateApplication } from '../entity/CandidateApplication';
import { Candidate } from '../entity/Candidate';
import { User } from '../entity/User';
import { In } from 'typeorm';

export class LecturerController {

  // Get courses for the current lecturer
  static async getMyCourses(req: Request, res: Response) {
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
  }

  // Add course to lecturer
  static async addCourse(req: Request, res: Response) {
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
  }

  // Remove course from lecturer
  static async removeCourse(req: Request, res: Response) {
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
  }

  // Get applications by ID
  static async getApplicationsByID(req: Request, res: Response) {
    try {
      const { applicationIds } = req.body;
      if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
        return res.status(400).json({ success: false, message: 'No application IDs provided' });
      }

      const appRepo = AppDataSource.getRepository(CandidateApplication);

      // Use QueryBuilder to join candidate, user, and course
      const applications = await appRepo
        .createQueryBuilder('application')
        .leftJoinAndSelect('application.candidate', 'candidate')
        .leftJoinAndSelect('candidate.user', 'user')
        .leftJoinAndSelect('application.course', 'course')
        .leftJoinAndSelect('candidate.academic_credentials', 'academic_credentials')
        .leftJoinAndSelect('candidate.previous_roles', 'previous_roles')
        .where('application.id IN (:...ids)', { ids: applicationIds })
        .getMany();

      // Map to ApplicantDisplayData
      const result = applications.map(app => ({
        id: app.id,
        tutorName: app.candidate?.user?.name || '',
        tutorEmail: app.candidate?.user?.email || '',
        courseId: app.course_id,
        courseCode: app.course?.code || '',
        courseName: app.course?.name || '',
        role: app.session_type,
        skills: app.skills || [],
        availability: app.availability,
        status: app.status,
        ranking: app.ranking,
        comments: app.comments,
        createdAt: app.created_at,
        academicCredentials: Array.isArray(app.candidate?.academic_credentials) ? app.candidate.academic_credentials : [],
        previousRoles: Array.isArray(app.candidate?.previous_roles) ? app.candidate.previous_roles : [],
      }));

      return res.json({ success: true, applications: result });
    } catch (error) {
      console.error('Error in getApplicationsByID:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}