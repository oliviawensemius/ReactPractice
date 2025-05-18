import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../entity/Course";
import { Lecturer } from "../entity/Lecturer";

export class CourseController {
    
    // Get all courses
    static async getAllCourses(req: Request, res: Response) {
        try {
            const courses = await AppDataSource.getRepository(Course).find();
            return res.status(200).json(courses);
        } catch (error) {
            console.error("Error fetching courses:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Get a single course by ID
    static async getCourseById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const course = await AppDataSource.getRepository(Course).findOne({
                where: { id },
                relations: ["applications", "lecturers"]
            });
            
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            
            return res.status(200).json(course);
        } catch (error) {
            console.error("Error fetching course:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Get courses for a specific lecturer
    static async getCoursesForLecturer(req: Request, res: Response) {
        try {
            const { lecturer_id } = req.params;
            
            const lecturer = await AppDataSource.getRepository(Lecturer).findOne({
                where: { id: lecturer_id },
                relations: ["courses"]
            });
            
            if (!lecturer) {
                return res.status(404).json({ message: "Lecturer not found" });
            }
            
            return res.status(200).json(lecturer.courses);
        } catch (error) {
            console.error("Error fetching lecturer courses:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Create a new course (admin only)
    static async createCourse(req: Request, res: Response) {
        try {
            const { code, name, semester, year } = req.body;
            
            if (!code || !name || !semester || !year) {
                return res.status(400).json({ message: "All fields are required" });
            }
            
            // Check if course code already exists
            const existingCourse = await AppDataSource.getRepository(Course).findOne({
                where: { code }
            });
            
            if (existingCourse) {
                return res.status(400).json({ message: "Course with this code already exists" });
            }
            
            const course = new Course();
            course.code = code;
            course.name = name;
            course.semester = semester;
            course.year = year;
            
            const savedCourse = await AppDataSource.getRepository(Course).save(course);
            return res.status(201).json(savedCourse);
        } catch (error) {
            console.error("Error creating course:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Update a course (admin only)
    static async updateCourse(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { code, name, semester, year } = req.body;
            
            const course = await AppDataSource.getRepository(Course).findOne({
                where: { id }
            });
            
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            
            if (code) course.code = code;
            if (name) course.name = name;
            if (semester) course.semester = semester;
            if (year) course.year = year;
            
            const updatedCourse = await AppDataSource.getRepository(Course).save(course);
            return res.status(200).json(updatedCourse);
        } catch (error) {
            console.error("Error updating course:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Delete a course (admin only)
    static async deleteCourse(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const course = await AppDataSource.getRepository(Course).findOne({
                where: { id }
            });
            
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            
            await AppDataSource.getRepository(Course).remove(course);
            return res.status(200).json({ message: "Course deleted successfully" });
        } catch (error) {
            console.error("Error deleting course:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}