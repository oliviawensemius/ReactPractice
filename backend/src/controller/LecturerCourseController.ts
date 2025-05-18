// backend/src/controller/LecturerCourseController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Lecturer } from "../entity/Lecturer";
import { Course } from "../entity/Course";

export class LecturerCourseController {
    
    // Add a course to lecturer's teaching list
    static async addCourseToLecturer(req: Request, res: Response) {
        try {
            const { lecturer_id, course_id } = req.body;
            
            if (!lecturer_id || !course_id) {
                return res.status(400).json({ message: "lecturer_id and course_id are required" });
            }
            
            // Find lecturer with current courses
            const lecturer = await AppDataSource.getRepository(Lecturer).findOne({
                where: { id: lecturer_id },
                relations: ["courses"]
            });
            
            if (!lecturer) {
                return res.status(404).json({ message: "Lecturer not found" });
            }
            
            // Find the course
            const course = await AppDataSource.getRepository(Course).findOne({
                where: { id: course_id }
            });
            
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            
            // Check if lecturer already teaches this course
            const alreadyTeaches = lecturer.courses.some(c => c.id === course_id);
            if (alreadyTeaches) {
                return res.status(400).json({ message: "Lecturer already teaches this course" });
            }
            
            // Add course to lecturer
            lecturer.courses.push(course);
            await AppDataSource.getRepository(Lecturer).save(lecturer);
            
            return res.status(200).json({ 
                message: "Course added successfully",
                courses: lecturer.courses 
            });
        } catch (error) {
            console.error("Error adding course to lecturer:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    
    // Remove a course from lecturer's teaching list
    static async removeCourseFromLecturer(req: Request, res: Response) {
        try {
            const { lecturer_id, course_id } = req.body;
            
            if (!lecturer_id || !course_id) {
                return res.status(400).json({ message: "lecturer_id and course_id are required" });
            }
            
            // Find lecturer with current courses
            const lecturer = await AppDataSource.getRepository(Lecturer).findOne({
                where: { id: lecturer_id },
                relations: ["courses"]
            });
            
            if (!lecturer) {
                return res.status(404).json({ message: "Lecturer not found" });
            }
            
            // Remove course from lecturer
            lecturer.courses = lecturer.courses.filter(c => c.id !== course_id);
            await AppDataSource.getRepository(Lecturer).save(lecturer);
            
            return res.status(200).json({ 
                message: "Course removed successfully",
                courses: lecturer.courses 
            });
        } catch (error) {
            console.error("Error removing course from lecturer:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    
    // Get all available courses (for adding to lecturer)
    static async getAvailableCourses(req: Request, res: Response) {
        try {
            const courses = await AppDataSource.getRepository(Course).find({
                order: { code: "ASC" }
            });
            
            return res.status(200).json(courses);
        } catch (error) {
            console.error("Error fetching available courses:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}