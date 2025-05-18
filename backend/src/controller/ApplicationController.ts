//Application controller
// - all: Get all applications (with filters)                                            IMPLEMENTED must confirm first that the logic is correct
// - one: Get a single application by ID                                                 IMPLEMENTED 
// - save: Create a new application                                                      IMPLEMENTED            
// - update: Update application status and comments                                      IMPLEMENTED notes: Seperate methods for status and comments , also to delete comments   
// - remove: Delete an application                                                       IMPLEMENTED    
// - getApplicationsByCandidate: Get applications for a specific tutor                   IMPLEMENTED
// - getApplicationsByCourse: Get applications for a specific course                     IMPLEMENTED

// Implement business logic:
// - Tutors can only see their own applications
// - Lecturers can only see applications for their courses
// - Applications need validation before saving


// Learning notes: {res.status(xxx)}
// - Use of async/await for asynchronous operations
// - 400 status is for bad requests from THEIR end (client)
// - 404 status is for not found (server). Issue on OUR end
// - 500 status is for internal server error (server). Issue on OUR end
// - 200 status is for success (server). WIN on OUR end. GOOD
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CandidateApplication, ApplicationStatus, SessionType } from "../entity/CandidateApplication";
import { Course } from "../entity/Course";
import { Candidate } from "../entity/Candidate";
import { AcademicCredential } from "../entity/AcademicCredential";
import { PreviousRole } from "../entity/PreviousRole";

export class ApplicationController {

    // Create a new application
    static async createApplication(req: Request, res: Response) {
        try {
            const { candidate_id, course_id, session_type, skills, availability, academic_credentials, previous_roles } = req.body;

            // Validation
            if (!candidate_id || !course_id || !session_type) {
                return res.status(400).json({
                    message: "candidate_id, course_id, and session_type are required"
                });
            }

            // Validate session type
            if (!Object.values(SessionType).includes(session_type)) {
                return res.status(400).json({ message: "Invalid session type" });
            }

            // Check if candidate exists
            const candidate = await AppDataSource.getRepository(Candidate).findOne({
                where: { id: candidate_id },
            });
            if (!candidate) {
                return res.status(404).json({ message: "Candidate not found" });
            }

            // Check if course exists
            const course = await AppDataSource.getRepository(Course).findOne({
                where: { id: course_id },
            });
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }

            // Check if application already exists for this candidate, course, and session type
            const existingApplication = await AppDataSource.getRepository(CandidateApplication).findOne({
                where: {
                    candidate: { id: candidate_id },
                    course: { id: course_id },
                    sessionType: session_type
                }
            });

            if (existingApplication) {
                return res.status(400).json({
                    message: "Application already exists for this course and session type"
                });
            }

            // Start transaction
            await AppDataSource.transaction(async transactionalEntityManager => {
                // Update candidate details
                if (skills && Array.isArray(skills)) {
                    candidate.skills = skills;
                }
                if (availability) {
                    candidate.availability = availability;
                }
                await transactionalEntityManager.save(candidate);

                // Save academic credentials
                if (academic_credentials && Array.isArray(academic_credentials)) {
                    for (const cred of academic_credentials) {
                        const academicCredential = new AcademicCredential();
                        academicCredential.degree = cred.degree;
                        academicCredential.institution = cred.institution;
                        academicCredential.year = cred.year;
                        academicCredential.gpa = cred.gpa;
                        academicCredential.candidate = candidate;
                        await transactionalEntityManager.save(academicCredential);
                    }
                }

                // Save previous roles
                if (previous_roles && Array.isArray(previous_roles)) {
                    for (const role of previous_roles) {
                        const previousRole = new PreviousRole();
                        previousRole.position = role.position;
                        previousRole.organisation = role.organisation;
                        previousRole.startDate = role.startDate;
                        previousRole.endDate = role.endDate;
                        previousRole.description = role.description;
                        previousRole.candidate = candidate;
                        await transactionalEntityManager.save(previousRole);
                    }
                }

                // Create application
                const application = new CandidateApplication();
                application.candidate = candidate;
                application.course = course;
                application.sessionType = session_type;
                application.status = ApplicationStatus.PENDING;
                application.comments = [];
                await transactionalEntityManager.save(application);

                // Return saved application with relations
                const savedApplication = await transactionalEntityManager.findOne(CandidateApplication, {
                    where: { id: application.id },
                    relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"]
                });

                return res.status(201).json(savedApplication);
            });

        } catch (error) {
            console.error("Error creating application:", error);
            return res.status(500).json({ message: "Internal server error" });
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
                return res.status(404).json({ message: "Application not found" });
            }

            return res.status(200).json(application);
        } catch (error) {
            console.error("Error fetching application:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Update application status
    static async updateApplicationStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validate status
            if (!Object.values(ApplicationStatus).includes(status)) {
                return res.status(400).json({ message: "Invalid status value" });
            }

            const application = await AppDataSource.getRepository(CandidateApplication).findOne({
                where: { id },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
            });

            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }

            application.status = status;
            const updatedApplication = await AppDataSource.getRepository(CandidateApplication).save(application);
            return res.status(200).json(updatedApplication);

        } catch (error) {
            console.error("Error updating application status:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Add comment to application
    static async addComment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { comment } = req.body;

            const application = await AppDataSource.getRepository(CandidateApplication).findOne({
                where: { id },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
            });

            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }

            if (!comment || comment.trim() === "") {
                return res.status(400).json({ message: "Comment is required" });
            }

            if (!application.comments) {
                application.comments = [];
            }
            application.comments.push(comment.trim());

            const updatedApplication = await AppDataSource.getRepository(CandidateApplication).save(application);
            return res.status(200).json(updatedApplication);
        } catch (error) {
            console.error("Error adding comment:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Delete comment from application
    static async deleteComment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { comment } = req.body;

            const application = await AppDataSource.getRepository(CandidateApplication).findOne({
                where: { id },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
            });

            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }

            if (!comment) {
                return res.status(400).json({ message: "Comment is required" });
            }

            if (application.comments) {
                application.comments = application.comments.filter((c) => c !== comment);
            }

            const updatedApplication = await AppDataSource.getRepository(CandidateApplication).save(application);
            return res.status(200).json(updatedApplication);
        } catch (error) {
            console.error("Error deleting comment:", error);
            return res.status(500).json({ message: "Internal server error" });
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
                return res.status(404).json({ message: "Application not found" });
            }

            await AppDataSource.getRepository(CandidateApplication).remove(application);
            return res.status(200).json({ message: "Application deleted successfully" });
        } catch (error) {
            console.error("Error deleting application:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Get applications by candidate
    static async getApplicationsByCandidate(req: Request, res: Response) {
        try {
            const { candidate_id } = req.params;

            const applications = await AppDataSource.getRepository(CandidateApplication).find({
                where: { candidate: { id: candidate_id } },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
                order: { createdAt: "DESC" },
            });

            return res.status(200).json(applications);
        } catch (error) {
            console.error("Error fetching applications by candidate:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Get applications by course
    static async getApplicationsByCourse(req: Request, res: Response) {
        try {
            const { course_id } = req.params;

            const applications = await AppDataSource.getRepository(CandidateApplication).find({
                where: { course: { id: course_id } },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
                order: { createdAt: "DESC" },
            });

            return res.status(200).json(applications);
        } catch (error) {
            console.error("Error fetching applications by course:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Get all applications with filters
    static async getAllApplications(req: Request, res: Response) {
        try {
            const { status, candidate_id, course_id, session_type } = req.query;
            const queryBuilder = AppDataSource.getRepository(CandidateApplication)
                .createQueryBuilder("application")
                .leftJoinAndSelect("application.candidate", "candidate")
                .leftJoinAndSelect("application.course", "course")
                .leftJoinAndSelect("candidate.academicCredentials", "academicCredentials")
                .leftJoinAndSelect("candidate.previousRoles", "previousRoles");

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

            return res.status(200).json(applications);
        } catch (error) {
            console.error("Error fetching applications:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Update application ranking
    static async updateApplicationRanking(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { ranking } = req.body;

            if (!ranking || ranking < 1) {
                return res.status(400).json({ message: "Valid ranking is required" });
            }

            const application = await AppDataSource.getRepository(CandidateApplication).findOne({
                where: { id },
                relations: ["candidate", "course", "candidate.academicCredentials", "candidate.previousRoles"],
            });

            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }

            application.ranking = ranking;
            const updatedApplication = await AppDataSource.getRepository(CandidateApplication).save(application);
            return res.status(200).json(updatedApplication);
        } catch (error) {
            console.error("Error updating application ranking:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    // Add this method to your ApplicationController class in backend/src/controller/ApplicationController.ts

    // Method to get applications by session type
    static async getApplicationsBySessionType(req: Request, res: Response) {
        try {
            const { session_type_id } = req.params;

            const applications = await AppDataSource.getRepository(CandidateApplication)
                .createQueryBuilder("application")
                .leftJoinAndSelect("application.candidate", "candidate")
                .leftJoinAndSelect("application.course", "course")
                .leftJoinAndSelect("application.sessionTypes", "sessionTypes")
                .where("sessionTypes.id = :sessionTypeId", { sessionTypeId: session_type_id })
                .orderBy("application.createdAt", "DESC")
                .getMany();

            return res.status(200).json(applications);
        } catch (error) {
            console.error("Error fetching applications by session type:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}