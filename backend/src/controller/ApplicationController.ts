// backend/src/controller/ApplicationController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CandidateApplication, ApplicationStatus, SessionType } from "../entity/CandidateApplication";
import { Course } from "../entity/Course";
import { Candidate } from "../entity/Candidate";
import { AcademicCredential } from "../entity/AcademicCredential";
import { PreviousRole } from "../entity/PreviousRole";
import { validateApplication, validateComment } from "../utils/validation";

export class ApplicationController {

    // Enhanced input validation using validation utilities
    private static validateApplicationInput(data: any): string[] {
        const validation = validateApplication(data);
        return validation.errors;
    }

    // Create a new application with enhanced validation and debugging
    static async createApplication(req: Request, res: Response) {
        console.log('=== CREATE APPLICATION ENDPOINT HIT ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        try {
            // Check if database connection exists
            if (!AppDataSource.isInitialized) {
                console.error('Database not initialized');
                return res.status(500).json({
                    success: false,
                    message: "Database not initialized"
                });
            }

            // Validate input
            const validationErrors = ApplicationController.validateApplicationInput(req.body);
            if (validationErrors.length > 0) {
                console.log('Validation failed:', validationErrors);
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validationErrors
                });
            }

            const { candidate_id, course_id, session_type, skills, availability, academic_credentials, previous_roles } = req.body;

            console.log('Looking up candidate with ID:', candidate_id);
            // Check if candidate exists
            const candidate = await AppDataSource.getRepository(Candidate).findOne({
                where: { id: candidate_id },
            });
            
            if (!candidate) {
                console.log('Candidate not found');
                return res.status(404).json({ 
                    success: false,
                    message: "Candidate not found" 
                });
            }
            console.log('Found candidate:', candidate.name);

            console.log('Looking up course with ID:', course_id);
            // Check if course exists
            const course = await AppDataSource.getRepository(Course).findOne({
                where: { id: course_id },
            });
            
            if (!course) {
                console.log('Course not found');
                return res.status(404).json({ 
                    success: false,
                    message: "Course not found" 
                });
            }
            console.log('Found course:', course.code, course.name);

            // Check if application already exists for this candidate, course, and session type
            console.log('Checking for existing application...');
            const existingApplication = await AppDataSource.getRepository(CandidateApplication).findOne({
                where: {
                    candidate: { id: candidate_id },
                    course: { id: course_id },
                    sessionType: session_type
                }
            });

            if (existingApplication) {
                console.log('Duplicate application found');
                return res.status(400).json({
                    success: false,
                    message: `You have already applied for ${course.code} as a ${session_type === 'tutor' ? 'tutor' : 'lab assistant'}`
                });
            }

            console.log('Starting database transaction...');
            // Start transaction for data consistency
            const result = await AppDataSource.transaction(async transactionalEntityManager => {
                console.log('Updating candidate basic info...');
                // Update candidate basic info
                if (skills && Array.isArray(skills)) {
                    candidate.skills = skills.map(skill => skill.trim()).filter(skill => skill.length > 0);
                }
                if (availability) {
                    candidate.availability = availability;
                }
                await transactionalEntityManager.save(candidate);
                console.log('Candidate updated successfully');

                // Clear existing credentials and roles for this candidate (to avoid duplicates)
                console.log('Clearing existing credentials and roles...');
                await transactionalEntityManager.delete(AcademicCredential, { candidate: { id: candidate_id } });
                await transactionalEntityManager.delete(PreviousRole, { candidate: { id: candidate_id } });

                // Save academic credentials
                if (academic_credentials && Array.isArray(academic_credentials)) {
                    console.log('Saving academic credentials:', academic_credentials.length);
                    for (const cred of academic_credentials) {
                        if (cred.degree && cred.institution && cred.year) {
                            const academicCredential = new AcademicCredential();
                            academicCredential.degree = cred.degree.trim();
                            academicCredential.institution = cred.institution.trim();
                            academicCredential.year = parseInt(cred.year);
                            // Fix for the null/number type issue
                            if (cred.gpa !== undefined && cred.gpa !== null) {
                                academicCredential.gpa = parseFloat(cred.gpa);
                            }
                            academicCredential.candidate = candidate;
                            await transactionalEntityManager.save(academicCredential);
                            console.log('Saved credential:', academicCredential.degree);
                        }
                    }
                }

                // Save previous roles
                if (previous_roles && Array.isArray(previous_roles)) {
                    console.log('Saving previous roles:', previous_roles.length);
                    for (const role of previous_roles) {
                        if (role.position && role.organisation && role.startDate) {
                            const previousRole = new PreviousRole();
                            previousRole.position = role.position.trim();
                            previousRole.organisation = role.organisation.trim();
                            previousRole.startDate = role.startDate;
                            previousRole.endDate = role.endDate || null;
                            previousRole.description = role.description ? role.description.trim() : null;
                            previousRole.candidate = candidate;
                            await transactionalEntityManager.save(previousRole);
                            console.log('Saved role:', previousRole.position);
                        }
                    }
                }

                // Create application
                console.log('Creating application...');
                const application = new CandidateApplication();
                application.candidate = candidate;
                application.course = course;
                application.sessionType = session_type;
                application.status = ApplicationStatus.PENDING;
                application.comments = [];
                await transactionalEntityManager.save(application);
                console.log('Application created with ID:', application.id);

                // Return saved application with relations
                const savedApplication = await transactionalEntityManager.findOne(CandidateApplication, {
                    where: { id: application.id },
                    relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"]
                });

                return savedApplication;
            });

            console.log('✅ Transaction completed successfully');
            
            // Send successful response
            return res.status(201).json({
                success: true,
                message: `Application for ${course.code} as ${session_type === 'tutor' ? 'tutor' : 'lab assistant'} submitted successfully`,
                application: result
            });

        } catch (error: unknown) {
            console.error("=== ERROR CREATING APPLICATION ===");
            console.error("Error:", error);
            
            // Handle the unknown error type
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            
            // Send error response
            return res.status(500).json({ 
                success: false,
                message: "Internal server error while creating application",
                error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error'
            });
        }
    }

    // Get application by ID
    static async getApplicationById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const application = await AppDataSource.getRepository(CandidateApplication).findOne({
                where: { id },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
            });

            if (!application) {
                return res.status(404).json({ 
                    success: false,
                    message: "Application not found" 
                });
            }

            return res.status(200).json({
                success: true,
                application
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Error fetching application:", errorMessage);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }

    // Update application status
    static async updateApplicationStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validate status
            if (!Object.values(ApplicationStatus).includes(status)) {
                return res.status(400).json({ 
                    success: false,
                    message: "Invalid status value. Must be 'pending', 'selected', or 'rejected'" 
                });
            }

            const application = await AppDataSource.getRepository(CandidateApplication).findOne({
                where: { id },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
            });

            if (!application) {
                return res.status(404).json({ 
                    success: false,
                    message: "Application not found" 
                });
            }

            // Update status
            application.status = status;
            
            // If selected, set a ranking (simple auto-increment for now)
            if (status === ApplicationStatus.SELECTED && !application.ranking) {
                const maxRanking = await AppDataSource.getRepository(CandidateApplication)
                    .createQueryBuilder("app")
                    .select("MAX(app.ranking)", "maxRanking")
                    .where("app.status = :status", { status: ApplicationStatus.SELECTED })
                    .getRawOne();
                
                application.ranking = (maxRanking?.maxRanking || 0) + 1;
            }

            const updatedApplication = await AppDataSource.getRepository(CandidateApplication).save(application);
            
            return res.status(200).json({
                success: true,
                message: `Application status updated to ${status}`,
                application: updatedApplication
            });

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Error updating application status:", errorMessage);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }

    // Add comment to application
    static async addComment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { comment } = req.body;

            // Validate comment
            if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
                return res.status(400).json({ 
                    success: false,
                    message: "Comment is required and must be a non-empty string" 
                });
            }

            if (comment.trim().length < 3) {
                return res.status(400).json({ 
                    success: false,
                    message: "Comment must be at least 3 characters" 
                });
            }

            if (comment.trim().length > 500) {
                return res.status(400).json({ 
                    success: false,
                    message: "Comment must be less than 500 characters" 
                });
            }

            const application = await AppDataSource.getRepository(CandidateApplication).findOne({
                where: { id },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
            });

            if (!application) {
                return res.status(404).json({ 
                    success: false,
                    message: "Application not found" 
                });
            }

            // Add comment
            if (!application.comments) {
                application.comments = [];
            }
            application.comments.push(comment.trim());

            const updatedApplication = await AppDataSource.getRepository(CandidateApplication).save(application);
            
            return res.status(200).json({
                success: true,
                message: "Comment added successfully",
                application: updatedApplication
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Error adding comment:", errorMessage);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }

    // Delete comment from application
    static async deleteComment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { comment } = req.body;

            if (!comment || typeof comment !== 'string') {
                return res.status(400).json({ 
                    success: false,
                    message: "Comment is required" 
                });
            }

            const application = await AppDataSource.getRepository(CandidateApplication).findOne({
                where: { id },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
            });

            if (!application) {
                return res.status(404).json({ 
                    success: false,
                    message: "Application not found" 
                });
            }

            // Remove comment
            if (application.comments) {
                application.comments = application.comments.filter((c) => c !== comment);
            }

            const updatedApplication = await AppDataSource.getRepository(CandidateApplication).save(application);
            
            return res.status(200).json({
                success: true,
                message: "Comment deleted successfully",
                application: updatedApplication
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Error deleting comment:", errorMessage);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }

    // Delete application
    static async deleteApplication(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const application = await AppDataSource.getRepository(CandidateApplication).findOne({
                where: { id },
                relations: ["candidate", "course"],
            });

            if (!application) {
                return res.status(404).json({ 
                    success: false,
                    message: "Application not found" 
                });
            }

            await AppDataSource.getRepository(CandidateApplication).remove(application);
            
            return res.status(200).json({ 
                success: true,
                message: "Application deleted successfully" 
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Error deleting application:", errorMessage);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }

    // Get applications by candidate
    static async getApplicationsByCandidate(req: Request, res: Response) {
        try {
            const { candidate_id } = req.params;

            // Check if the requesting user is authorized
            const user = (req.session as any).user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            // Only allow admin or the candidate themselves to view their applications
            if (user.role !== 'admin' && user.id !== candidate_id) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - You don't have permission to view these applications"
                });
            }

            const applications = await AppDataSource.getRepository(CandidateApplication).find({
                where: { candidate: { id: candidate_id } },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
                order: { createdAt: "DESC" },
            });

            return res.status(200).json({
                success: true,
                applications
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Error fetching applications by candidate:", errorMessage);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }

    // Get applications by course
    static async getApplicationsByCourse(req: Request, res: Response) {
        try {
            const { course_id } = req.params;

            // Check if the requesting user is authorized
            const user = (req.session as any).user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            // If user is a lecturer, verify they are assigned to this course
            if (user.role === 'lecturer') {
                const isAssigned = await AppDataSource.createQueryBuilder()
                    .select("lc.lecturer_id")
                    .from("lecturer_courses", "lc")
                    .where("lc.lecturer_id = :lecturerId AND lc.course_id = :courseId", {
                        lecturerId: user.id,
                        courseId: course_id
                    })
                    .getRawOne();

                if (!isAssigned) {
                    return res.status(403).json({
                        success: false,
                        message: "Forbidden - You are not assigned to this course"
                    });
                }
            }

            // Get applications for this course
            const applications = await AppDataSource.getRepository(CandidateApplication).find({
                where: { course: { id: course_id } },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
                order: { createdAt: "DESC" },
            });

            return res.status(200).json({
                success: true,
                applications
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Error fetching applications by course:", errorMessage);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }

    // Get all applications with filters
    static async getAllApplications(req: Request, res: Response) {
        try {
            const { status, candidate_id, course_id, session_type } = req.query;
            
            // Check if the requesting user is authorized
            const user = (req.session as any).user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            // Build the query
            const queryBuilder = AppDataSource.getRepository(CandidateApplication)
                .createQueryBuilder("application")
                .leftJoinAndSelect("application.candidate", "candidate")
                .leftJoinAndSelect("application.course", "course")
                .leftJoinAndSelect("candidate.academicCredentials", "academicCredentials")
                .leftJoinAndSelect("candidate.previousRoles", "previousRoles");

            // If user is a lecturer, restrict to their assigned courses
            if (user.role === 'lecturer') {
                queryBuilder.innerJoin(
                    "lecturer_courses",
                    "lc",
                    "lc.course_id = course.id AND lc.lecturer_id = :lecturerId",
                    { lecturerId: user.id }
                );
            }

            // Apply filters
            if (status) {
                queryBuilder.andWhere("application.status = :status", { status });
            }
            if (candidate_id) {
                queryBuilder.andWhere("candidate.id = :candidateId", { candidateId: candidate_id });
            }
            if (course_id) {
                queryBuilder.andWhere("course.id = :courseId", { courseId: course_id });
            }
            if (session_type) {
                queryBuilder.andWhere("application.sessionType = :sessionType", { sessionType: session_type });
            }

            const applications = await queryBuilder
                .orderBy("application.createdAt", "DESC")
                .getMany();

            return res.status(200).json({
                success: true,
                applications
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Error fetching applications:", errorMessage);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }

    // Update application ranking
    static async updateApplicationRanking(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { ranking } = req.body;

            if (!ranking || !Number.isInteger(ranking) || ranking < 1) {
                return res.status(400).json({ 
                    success: false,
                    message: "Valid ranking (positive integer) is required" 
                });
            }

            const application = await AppDataSource.getRepository(CandidateApplication).findOne({
                where: { id },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
            });

            if (!application) {
                return res.status(404).json({ 
                    success: false,
                    message: "Application not found" 
                });
            }

            if (application.status !== ApplicationStatus.SELECTED) {
                return res.status(400).json({ 
                    success: false,
                    message: "Only selected applications can be ranked" 
                });
            }

            application.ranking = ranking;
            const updatedApplication = await AppDataSource.getRepository(CandidateApplication).save(application);
            
            return res.status(200).json({
                success: true,
                message: "Application ranking updated successfully",
                application: updatedApplication
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Error updating application ranking:", errorMessage);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }

    // Get applications by session type
    static async getApplicationsBySessionType(req: Request, res: Response) {
        try {
            const { session_type_id } = req.params;

            // Validate session type
            if (!Object.values(SessionType).includes(session_type_id as SessionType)) {
                return res.status(400).json({ 
                    success: false,
                    message: "Invalid session type" 
                });
            }

            // Check if the requesting user is authorized
            const user = (req.session as any).user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            // Build the query
            const queryBuilder = AppDataSource.getRepository(CandidateApplication)
                .createQueryBuilder("application")
                .leftJoinAndSelect("application.candidate", "candidate")
                .leftJoinAndSelect("application.course", "course")
                .leftJoinAndSelect("candidate.academicCredentials", "academicCredentials")
                .leftJoinAndSelect("candidate.previousRoles", "previousRoles")
                .where("application.sessionType = :sessionType", { sessionType: session_type_id });

            // If user is a lecturer, restrict to their assigned courses
            if (user.role === 'lecturer') {
                queryBuilder.innerJoin(
                    "lecturer_courses",
                    "lc",
                    "lc.course_id = course.id AND lc.lecturer_id = :lecturerId",
                    { lecturerId: user.id }
                );
            }

            const applications = await queryBuilder
                .orderBy("application.createdAt", "DESC")
                .getMany();

            return res.status(200).json({
                success: true,
                applications
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Error fetching applications by session type:", errorMessage);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }
}