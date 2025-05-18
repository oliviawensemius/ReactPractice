// Application controller
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
import { v4 as uuid4 } from "uuid";
import { AppDataSource } from "../data-source";
import { Application, ApplicationStatus } from "../entity/Application";
import { Course } from "../entity/Course";
import { Candidate } from "../entity/Candidate";

export class ApplicationController {

// method for application submission handlng
    static async createApplication(req: Request, res: Response) {
        try {
            const {ranking, candidate_id, course_id} = req.body;

            // ensure all fields are acctually provided
            if (!ranking || !candidate_id || !course_id) {
                return res.status(400).json({ message: "All fields are required" });
            }
            // check if the candidate exists
            const candidate = await AppDataSource.getRepository(Candidate).findOne({
                where: { id: candidate_id },
            });
            if (!candidate) {
                return res.status(404).json({ message: "Candidate not found" });
            }
            // check if the course exists
            const course = await AppDataSource.getRepository(Course).findOne({
                where: { id: course_id },
            });
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            // create a new application
            const application = new Application();
            // uuid for id using uuid4 which is imported above seems to be the standard accoring to stack overflow
            application.id = uuid4(); 
            application.status = ApplicationStatus.PENDING; // default status
            application.ranking = ranking;
            application.createdAt = new Date();
            application.candidate = candidate;
            application.course = course;
            // save the application to the database
            const savedApplication = await AppDataSource.getRepository(Application).save(application);
            return res.status(201).json(savedApplication);
        } catch (error) {
            console.error("Error creating application:", error);
            return res.status(500).json({ message: "Internal server error" });
        }   
    }

   // method for getting a SINGLE application by id
    static async getApplicationById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const application = await AppDataSource.getRepository(Application).findOne({
                where: { id },
                relations: ["candidate", "course"],
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

    // method update Status
    static async updateApplicationStatus(req: Request, res: Response) {
        try {
            const { id} = req.params;
            const { status } = req.body;
            const application = await AppDataSource.getRepository(Application).findOne({
                where: { id}, 
                relations: ["candidate", "course"],
            });
            if (!id) {
                return res.status(400).json({ message: "Application ID is required" });     
            }
            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }
            application.status = status;
            const updatedApplication = await AppDataSource.getRepository(Application).save(application);
            return res.status (200).json(updatedApplication);

        } catch (error) {
            console.error("Error updating application status:", error);
            return res.status(500).json({ message: "Internal server error" }); 
        }

    }

    // mwthod for adding comments 
    static async addComment(req: Request, res:Response) {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            const application = await AppDataSource.getRepository(Application).findOne({
                where: { id },
                relations: ["candidate", "course"],
            });
            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }
            if (!comment) {
                return res.status(400).json({ message: "Comment is required" });
            }
            application.comments.push(comment);
            const updatedApplication = await AppDataSource.getRepository(Application).save(application);
            return res.status(200).json(updatedApplication);
        } catch (error) {
            console.error("Error adding comment:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

    }

    // ,ehtod to delete comments  ---- ISSUE is need to acctually put comment in this. Can change to index of comment maybe? -----
    static async deleteComment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            const application = await AppDataSource.getRepository(Application).findOne({
                where: { id },
                relations: ["candidate", "course"],
            });
            if (!application) {
                return res.status(404).json({ message: "Application not found" });
            }
            if (!comment) {
                return res.status(400).json({ message: "Comment is required" });
            }
            application.comments = application.comments.filter((c) => c !== comment);
            const updatedApplication = await AppDataSource.getRepository(Application).save(application);
            return res.status(200).json(updatedApplication);
        } catch (error) {
            console.error("Error deleting comment:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // method to delete application (wondering if this is even needed, cant imagine any circumstances)
    static async deleteApplication(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const application = await AppDataSource.getRepository(Application).findOne({
                where: { id },
                relations: ["candidate", "course"],
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
    
    // method for getting all applications for a specific candidate
    static async getApplicationsByCandidate(req: Request, res: Response) {
        try {
            const { candidate_id } = req.params;
            const applications = await AppDataSource.getRepository(Application).find({
                where: { candidate: { id: candidate_id } },
                relations: ["candidate", "course"],
            });
            if (!applications) {
                return res.status(404).json({ message: "No applications found for this candidate" });
            }
            return res.status(200).json(applications);
        } catch (error) {
            console.error("Error fetching applications by candidate:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    

    // method for getting all applications for a sepecific course
    static async getApplicationsByCourse(req: Request, res: Response) {
        try {
            const { course_id } = req.params;
            const applications = await AppDataSource.getRepository(Application).find({
                where: { course: { id: course_id } },
                relations: ["candidate", "course"],
            });
            if (!applications) {
                return res.status(404).json({ message: "No applications found for this course" });
            }
            return res.status(200).json(applications);
        } catch (error) {
            console.error("Error fetching applications by course:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // method for getting all applications (with filters) ---- NOT SURE IF CORRECT -----
    static async getAllApplications(req: Request, res: Response) {
        try {
            const { status, candidate_id, course_id } = req.query;
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

            const applications = await AppDataSource.getRepository(Application).find({
                where: whereConditions,
                relations: ["candidate", "course"],
            });
            return res.status(200).json(applications);
        } catch (error) {
            console.error("Error fetching applications:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

}

