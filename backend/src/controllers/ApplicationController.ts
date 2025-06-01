// backend/src/controllers/ApplicationController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { CandidateApplication } from '../entity/CandidateApplication';
import { Candidate } from '../entity/Candidate';
import { Course } from '../entity/Course';
import { User } from '../entity/User';
import { Lecturer } from '../entity/Lecturer';
import { AcademicCredential } from '../entity/AcademicCredential';
import { PreviousRole } from '../entity/PreviousRole';
import { validateApplication, validateComment } from '../utils/validation';

export class ApplicationController {

  // Submit application (candidates only)
  static async submitApplication(req: Request, res: Response) {
    try {
      const { course_id, session_type, skills, availability, academic_credentials, previous_roles } = req.body;
      
      // Get candidate ID from user session
      const candidateRepo = AppDataSource.getRepository(Candidate);
      const candidate = await candidateRepo.findOne({ 
        where: { user_id: req.session.userId } 
      });

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate profile not found'
        });
      }

      // Prepare application data for validation
      const applicationData = {
        candidate_id: candidate.id,
        course_id,
        session_type,
        skills,
        availability,
        academic_credentials,
        previous_roles
      };

      // Validate application data
      const validation = validateApplication(applicationData);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Check if course exists
      const courseRepo = AppDataSource.getRepository(Course);
      const course = await courseRepo.findOne({ where: { id: course_id } });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if application already exists for this course and session type
      const applicationRepo = AppDataSource.getRepository(CandidateApplication);
      const existingApplication = await applicationRepo.findOne({
        where: {
          candidate_id: candidate.id,
          course_id,
          session_type
        }
      });

      if (existingApplication) {
        return res.status(409).json({
          success: false,
          message: 'You have already applied for this position'
        });
      }

      // Create application
      const application = applicationRepo.create({
        candidate_id: candidate.id,
        course_id,
        session_type,
        skills,
        availability,
        status: 'Pending'
      });

      const savedApplication = await applicationRepo.save(application);

      // Save academic credentials
      if (academic_credentials && academic_credentials.length > 0) {
        const credentialRepo = AppDataSource.getRepository(AcademicCredential);
        
        for (const cred of academic_credentials) {
          const credential = credentialRepo.create({
            candidate_id: candidate.id,
            degree: cred.degree,
            institution: cred.institution,
            year: cred.year,
            gpa: cred.gpa ? parseFloat(cred.gpa) : undefined
          });
          await credentialRepo.save(credential);
        }
      }

      // Save previous roles
      if (previous_roles && previous_roles.length > 0) {
        const roleRepo = AppDataSource.getRepository(PreviousRole);
        
        for (const role of previous_roles) {
          const previousRole = roleRepo.create({
            candidate_id: candidate.id,
            position: role.position,
            organisation: role.organisation,
            start_date: new Date(role.startDate),
            end_date: role.endDate ? new Date(role.endDate) : undefined,
            description: role.description
          });
          await roleRepo.save(previousRole);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        application: {
          id: savedApplication.id,
          course_id: savedApplication.course_id,
          session_type: savedApplication.session_type,
          status: savedApplication.status,
          created_at: savedApplication.created_at
        }
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting application'
      });
    }
  }

  // Get applications by candidate
  static async getCandidateApplications(req: Request, res: Response) {
    try {
      // Get candidate ID from user session
      const candidateRepo = AppDataSource.getRepository(Candidate);
      const candidate = await candidateRepo.findOne({ 
        where: { user_id: req.session.userId } 
      });

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate profile not found'
        });
      }

      // Get applications with course details
      const applicationRepo = AppDataSource.getRepository(CandidateApplication);
      const applications = await applicationRepo.find({
        where: { candidate_id: candidate.id },
        relations: ['course'],
        order: { created_at: 'DESC' }
      });

      res.json({
        success: true,
        applications: applications.map(app => ({
          id: app.id,
          course: {
            id: app.course.id,
            code: app.course.code,
            name: app.course.name
          },
          session_type: app.session_type,
          status: app.status,
          ranking: app.ranking,
          comments: app.comments || [],
          createdAt: app.created_at
        }))
      });

    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching applications'
      });
    }
  }

  // Get applications for lecturer review
  static async getApplicationsForReview(req: Request, res: Response) {
    try {
      console.log('Getting applications for lecturer:', req.session.userId);
      
      // Get lecturer and their courses
      const lecturerRepo = AppDataSource.getRepository(Lecturer);
      const lecturer = await lecturerRepo.findOne({
        where: { user_id: req.session.userId },
        relations: ['courses']
      });

      if (!lecturer) {
        console.log('Lecturer profile not found for user:', req.session.userId);
        return res.status(404).json({
          success: false,
          message: 'Lecturer profile not found'
        });
      }

      console.log('Lecturer courses count:', lecturer.courses?.length || 0);
      const courseIds = lecturer.courses?.map(course => course.id) || [];

      if (courseIds.length === 0) {
        console.log('No courses assigned to lecturer');
        return res.json({
          success: true,
          applications: []
        });
      }

      console.log('Looking for applications in courses:', courseIds);

      // Get applications for lecturer's courses
      const applicationRepo = AppDataSource.getRepository(CandidateApplication);
      
      const applications = await applicationRepo
        .createQueryBuilder('app')
        .leftJoinAndSelect('app.candidate', 'candidate')
        .leftJoinAndSelect('candidate.user', 'user')
        .leftJoinAndSelect('app.course', 'course')
        .leftJoinAndSelect('candidate.academic_credentials', 'credentials')
        .leftJoinAndSelect('candidate.previous_roles', 'roles')
        .where('app.course_id IN (:...courseIds)', { courseIds })
        .orderBy('app.created_at', 'DESC')
        .getMany();

      console.log('Found applications:', applications.length);

      // Format applications for frontend
      const formattedApplications = applications.map(app => ({
        id: app.id,
        tutorName: app.candidate.user.name,
        tutorEmail: app.candidate.user.email,
        courseId: app.course.id,
        courseCode: app.course.code,
        courseName: app.course.name,
        role: app.session_type,
        skills: app.skills,
        availability: app.availability,
        status: app.status,
        ranking: app.ranking,
        comments: app.comments || [],
        createdAt: app.created_at,
        academicCredentials: app.candidate.academic_credentials?.map(cred => ({
          id: cred.id,
          degree: cred.degree,
          institution: cred.institution,
          year: cred.year,
          gpa: cred.gpa
        })) || [],
        previousRoles: app.candidate.previous_roles?.map(role => ({
          id: role.id,
          position: role.position,
          organisation: role.organisation,
          startDate: role.start_date ? ApplicationController.formatDate(role.start_date) : undefined,
          endDate: role.end_date ? ApplicationController.formatDate(role.end_date) : undefined,
          description: role.description
        })) || []
      }));

      console.log('Returning formatted applications:', formattedApplications.length);

      res.json({
        success: true,
        applications: formattedApplications
      });

    } catch (error) {
      console.error('Error fetching applications for review:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching applications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update application status (lecturers only)
  static async updateApplicationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['Pending', 'Selected', 'Rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be Pending, Selected, or Rejected'
        });
      }

      const applicationRepo = AppDataSource.getRepository(CandidateApplication);
      const application = await applicationRepo.findOne({
        where: { id },
        relations: ['course']
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Update status
      application.status = status;
      await applicationRepo.save(application);

      res.json({
        success: true,
        message: 'Application status updated successfully',
        application: {
          id: application.id,
          status: application.status
        }
      });

    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating application status'
      });
    }
  }

  // Add comment to application (lecturers only)
  static async addComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { comment } = req.body;

      // Validate comment
      const commentValidation = validateComment(comment);
      if (!commentValidation.valid) {
        return res.status(400).json({
          success: false,
          message: commentValidation.message
        });
      }

      const applicationRepo = AppDataSource.getRepository(CandidateApplication);
      const application = await applicationRepo.findOne({ where: { id } });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Add comment to existing comments array
      const existingComments = application.comments || [];
      existingComments.push(comment.trim());
      application.comments = existingComments;

      await applicationRepo.save(application);

      res.json({
        success: true,
        message: 'Comment added successfully',
        comments: application.comments
      });

    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding comment'
      });
    }
  }

  // Update application ranking (lecturers only)
  static async updateRanking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { ranking } = req.body;

      if (!ranking || ranking < 1) {
        return res.status(400).json({
          success: false,
          message: 'Ranking must be a positive number'
        });
      }

      const applicationRepo = AppDataSource.getRepository(CandidateApplication);
      const application = await applicationRepo.findOne({ where: { id } });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      application.ranking = parseInt(ranking);
      await applicationRepo.save(application);

      res.json({
        success: true,
        message: 'Ranking updated successfully',
        application: {
          id: application.id,
          ranking: application.ranking
        }
      });

    } catch (error) {
      console.error('Error updating ranking:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating ranking'
      });
    }
  }

  // Helper: Format date for display
  private static formatDate(date: Date | string): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return String(date);
  }
}