import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { In } from "typeorm";
import { AppDataSource } from "../data-source";
import { Application, ApplicationStatus } from "../entity/Application";
import { Course } from "../entity/Course";
import { Candidate } from "../entity/Candidate";
import { SessionType } from "../entity/SessionType";

export class ApplicationController {

    // Method for application submission handling
    static async createApplication(req: Request, res: Response) {
        try {
            const { candidate_id, course_id, session_type_ids, ranking = 1 } = req.body;

            // Validation
            if (!candidate_id || !course_id || !session_type_ids || !Array.isArray(session_type_ids)) {
                return res.status(400).json({ 
                    message: "candidate_id, course_id, and session_type_ids are required" 
                });
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

            // Check if session types exist
            const sessionTypeRepository = AppDataSource.getRepository(SessionType);
            const sessionTypes = await sessionTypeRepository.findBy({
                id: In(session_type_ids)
            });
            
            if (sessionTypes.length !== session_type_ids.length) {
                return res.status(404).json({ message: "One or more session types not found" });
            }

            // Create new application
            const application = new Application();
            application.id = uuidv4();
            application.status = ApplicationStatus.PENDING;
            application.ranking = ranking;
            application.createdAt = new Date();
            application.candidate = candidate;
            application.course = course;
            application.sessionTypes = sessionTypes;
            application.comments = [];

            // Save the application
            const savedApplication = await AppDataSource.getRepository(Application).save(application);
            
            // Return with relations loaded
            const fullApplication = await AppDataSource.getRepository(Application).findOne({
                where: { id: savedApplication.id },
                relations: ["candidate", "course", "sessionTypes"]
            });

            return res.status(201).json(fullApplication);
        } catch (error) {
            console.error("Error creating application:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Method for getting a SINGLE application by id
    static async getApplicationById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const application = await AppDataSource.getRepository(Application).findOne({
                where: { id },
                relations: ["candidate", "course", "sessionTypes"],
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

    // Method to update status
    static async updateApplicationStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            // Validate status
            if (!Object.values(ApplicationStatus).includes(status)) {
                return res.status(400).json({ message: "Invalid status value" });
            }
            
            const application = await AppDataSource.getRepository(Application).findOne({
                where: { id }, 
                relations: ["candidate", "course", "sessionTypes"],
            });
            
            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }
            
            application.status = status;
            const updatedApplication = await AppDataSource.getRepository(Application).save(application);
            return res.status(200).json(updatedApplication);

        } catch (error) {
            console.error("Error updating application status:", error);
            return res.status(500).json({ message: "Internal server error" }); 
        }
    }

    // Method for adding comments 
    static async addComment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            
            const application = await AppDataSource.getRepository(Application).findOne({
                where: { id },
                relations: ["candidate", "course", "sessionTypes"],
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
            
            const updatedApplication = await AppDataSource.getRepository(Application).save(application);
            return res.status(200).json(updatedApplication);
        } catch (error) {
            console.error("Error adding comment:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Method to delete comments
    static async deleteComment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            
            const application = await AppDataSource.getRepository(Application).findOne({
                where: { id },
                relations: ["candidate", "course", "sessionTypes"],
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
            
            const updatedApplication = await AppDataSource.getRepository(Application).save(application);
            return res.status(200).json(updatedApplication);
        } catch (error) {
            console.error("Error deleting comment:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Method to delete application
    static async deleteApplication(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const application = await AppDataSource.getRepository(Application).findOne({
                where: { id },
                relations: ["candidate", "course", "sessionTypes"],
            });
            
            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }
            
            await AppDataSource.getRepository(Application).remove(application);
            return res.status(200).json({ message: "Application deleted successfully" });
        } catch (error) {
            console.error("Error deleting application:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    
    // Method for getting all applications for a specific candidate
    static async getApplicationsByCandidate(req: Request, res: Response) {
        try {
            const { candidate_id } = req.params;
            
            const applications = await AppDataSource.getRepository(Application).find({
                where: { candidate: { id: candidate_id } },
                relations: ["candidate", "course", "sessionTypes"],
                order: { createdAt: "DESC" },
            });
            
            return res.status(200).json(applications);
        } catch (error) {
            console.error("Error fetching applications by candidate:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    
    // Method for getting all applications for a specific course
    static async getApplicationsByCourse(req: Request, res: Response) {
        try {
            const { course_id } = req.params;
            
            const applications = await AppDataSource.getRepository(Application).find({
                where: { course: { id: course_id } },
                relations: ["candidate", "course", "sessionTypes"],
                order: { createdAt: "DESC" },
            });
            
            return res.status(200).json(applications);
        } catch (error) {
            console.error("Error fetching applications by course:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Method for getting all applications (with filters)
    static async getAllApplications(req: Request, res: Response) {
        try {
            const { status, candidate_id, course_id, session_type_id } = req.query;
            const whereConditions: any = {};

            if (status) {
                whereConditions.status = status;
            }
            if (candidate_id) {
                whereConditions.candidate = { id: candidate_id };
            }
            if (course_id) {
                whereConditions.course = { id: course_id };
            }

            let applications;

            if (session_type_id) {
                // If filtering by session type, use query builder
                const queryBuilder = AppDataSource.getRepository(Application)
                    .createQueryBuilder("application")
                    .leftJoinAndSelect("application.candidate", "candidate")
                    .leftJoinAndSelect("application.course", "course")
                    .leftJoinAndSelect("application.sessionTypes", "sessionTypes")
                    .where("sessionTypes.id = :sessionTypeId", { sessionTypeId: session_type_id });

                // Add other conditions
                if (status) {
                    queryBuilder.andWhere("application.status = :status", { status });
                }
                if (candidate_id) {
                    queryBuilder.andWhere("candidate.id = :candidateId", { candidateId: candidate_id });
                }
                if (course_id) {
                    queryBuilder.andWhere("course.id = :courseId", { courseId: course_id });
                }

                applications = await queryBuilder
                    .orderBy("application.createdAt", "DESC")
                    .getMany();
            } else {
                applications = await AppDataSource.getRepository(Application).find({
                    where: whereConditions,
                    relations: ["candidate", "course", "sessionTypes"],
                    order: { createdAt: "DESC" },
                });
            }
            
            return res.status(200).json(applications);
        } catch (error) {
            console.error("Error fetching applications:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Method for updating application ranking
    static async updateApplicationRanking(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { ranking } = req.body;
            
            if (!ranking || ranking < 1) {
                return res.status(400).json({ message: "Valid ranking is required" });
            }
            
            const application = await AppDataSource.getRepository(Application).findOne({
                where: { id },
                relations: ["candidate", "course", "sessionTypes"],
            });
            
            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }
            
            application.ranking = ranking;
            const updatedApplication = await AppDataSource.getRepository(Application).save(application);
            return res.status(200).json(updatedApplication);
        } catch (error) {
            console.error("Error updating application ranking:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Method to get applications by session type
    static async getApplicationsBySessionType(req: Request, res: Response) {
        try {
            const { session_type_id } = req.params;
            
            const applications = await AppDataSource.getRepository(Application)
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