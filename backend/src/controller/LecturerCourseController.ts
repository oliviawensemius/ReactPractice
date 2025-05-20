// backend/src/controller/LecturerCourseController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Lecturer } from "../entity/Lecturer";
import { Course } from "../entity/Course";
import { UserRole } from "../entity/User";

export class LecturerCourseController {
    
    // Check if a lecturer is assigned to a course
    static async isLecturerAssignedToCourse(lecturerId: string, courseId: string): Promise<boolean> {
        try {
            const result = await AppDataSource.createQueryBuilder()
                .select("lc.lecturer_id")
                .from("lecturer_courses", "lc")
                .where("lc.lecturer_id = :lecturerId AND lc.course_id = :courseId", {
                    lecturerId,
                    courseId
                })
                .getRawOne();
            
            return !!result;
        } catch (error) {
            console.error("Error checking lecturer course assignment:", error);
            return false;
        }
    }
    
    // Add a course to lecturer's teaching list
    static async addCourseToLecturer(req: Request, res: Response) {
        try {
            const { lecturer_id, course_id } = req.body;
            
            if (!lecturer_id || !course_id) {
                return res.status(400).json({ 
                    success: false,
                    message: "lecturer_id and course_id are required" 
                });
            }
            
            // Check authorization
            const user = (req.session as any).user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }
            
            // Only admin can assign courses to any lecturer
            // A lecturer can only assign courses to themselves
            if (user.role !== UserRole.ADMIN && user.id !== lecturer_id) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - You can only modify your own courses"
                });
            }
            
            // Find lecturer with current courses
            const lecturer = await AppDataSource.getRepository(Lecturer).findOne({
                where: { id: lecturer_id },
                relations: ["courses"]
            });
            
            if (!lecturer) {
                return res.status(404).json({ 
                    success: false,
                    message: "Lecturer not found" 
                });
            }
            
            // Find the course
            const course = await AppDataSource.getRepository(Course).findOne({
                where: { id: course_id }
            });
            
            if (!course) {
                return res.status(404).json({ 
                    success: false,
                    message: "Course not found" 
                });
            }
            
            // Check if lecturer already teaches this course
            const alreadyTeaches = lecturer.courses.some(c => c.id === course_id);
            if (alreadyTeaches) {
                return res.status(400).json({ 
                    success: false,
                    message: "Lecturer already teaches this course" 
                });
            }
            
            // Add course to lecturer
            lecturer.courses.push(course);
            await AppDataSource.getRepository(Lecturer).save(lecturer);
            
            return res.status(200).json({ 
                success: true,
                message: "Course added successfully",
                courses: lecturer.courses 
            });
        } catch (error) {
            console.error("Error adding course to lecturer:", error);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }
    
    // Remove a course from lecturer's teaching list
    static async removeCourseFromLecturer(req: Request, res: Response) {
        try {
            const { lecturer_id, course_id } = req.body;
            
            if (!lecturer_id || !course_id) {
                return res.status(400).json({ 
                    success: false,
                    message: "lecturer_id and course_id are required" 
                });
            }
            
            // Check authorization
            const user = (req.session as any).user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }
            
            // Only admin can remove courses from any lecturer
            // A lecturer can only remove courses from themselves
            if (user.role !== UserRole.ADMIN && user.id !== lecturer_id) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - You can only modify your own courses"
                });
            }
            
            // Find lecturer with current courses
            const lecturer = await AppDataSource.getRepository(Lecturer).findOne({
                where: { id: lecturer_id },
                relations: ["courses"]
            });
            
            if (!lecturer) {
                return res.status(404).json({ 
                    success: false,
                    message: "Lecturer not found" 
                });
            }
            
            // Check if course exists in lecturer's courses
            const courseExists = lecturer.courses.some(c => c.id === course_id);
            if (!courseExists) {
                return res.status(400).json({ 
                    success: false,
                    message: "Lecturer does not teach this course" 
                });
            }
            
            // Remove course from lecturer
            lecturer.courses = lecturer.courses.filter(c => c.id !== course_id);
            await AppDataSource.getRepository(Lecturer).save(lecturer);
            
            return res.status(200).json({ 
                success: true,
                message: "Course removed successfully",
                courses: lecturer.courses 
            });
        } catch (error) {
            console.error("Error removing course from lecturer:", error);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }
    
    // Get all available courses (for adding to lecturer)
    static async getAvailableCourses(req: Request, res: Response) {
        try {
            // Check authentication
            if (!req.session || !(req.session as any).user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }
            
            const user = (req.session as any).user;
            
            // For a lecturer, get only the courses they don't already teach
            if (user.role === UserRole.LECTURER) {
                // Get the lecturer with their current courses
                const lecturer = await AppDataSource.getRepository(Lecturer).findOne({
                    where: { id: user.id },
                    relations: ["courses"]
                });
                
                if (!lecturer) {
                    return res.status(404).json({
                        success: false,
                        message: "Lecturer not found"
                    });
                }
                
                // Get the IDs of courses the lecturer already teaches
                const currentCourseIds = lecturer.courses.map(c => c.id);
                
                // Get all courses that the lecturer doesn't already teach
                let queryBuilder = AppDataSource.getRepository(Course)
                    .createQueryBuilder("course")
                    .orderBy("course.code", "ASC");
                
                if (currentCourseIds.length > 0) {
                    queryBuilder = queryBuilder.where("course.id NOT IN (:...currentCourseIds)", { currentCourseIds });
                }
                
                const availableCourses = await queryBuilder.getMany();
                
                return res.status(200).json(availableCourses);
            } 
            // For admin, get all courses
            else if (user.role === UserRole.ADMIN) {
                const courses = await AppDataSource.getRepository(Course).find({
                    order: { code: "ASC" }
                });
                
                return res.status(200).json(courses);
            } 
            // For other roles (candidates), return forbidden
            else {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - Only lecturers and admins can access this resource"
                });
            }
        } catch (error) {
            console.error("Error fetching available courses:", error);
            return res.status(500).json({ 
                success: false,
                message: "Internal server error" 
            });
        }
    }

    // Get all lecturers assigned to a course
    static async getLecturersForCourse(req: Request, res: Response) {
        try {
            const { course_id } = req.params;
            
            if (!course_id) {
                return res.status(400).json({
                    success: false,
                    message: "Course ID is required"
                });
            }
            
            // Check if the course exists
            const course = await AppDataSource.getRepository(Course).findOne({
                where: { id: course_id },
                relations: ["lecturers"]
            });
            
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: "Course not found"
                });
            }
            
            // Return the lecturers assigned to the course
            return res.status(200).json({
                success: true,
                lecturers: course.lecturers
            });
        } catch (error) {
            console.error("Error fetching lecturers for course:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Assign multiple courses to a lecturer
    static async assignCoursesToLecturer(req: Request, res: Response) {
        try {
            const { lecturer_id, course_ids } = req.body;
            
            if (!lecturer_id || !course_ids || !Array.isArray(course_ids) || course_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Lecturer ID and at least one course ID are required"
                });
            }
            
            // Check authorization (admin only)
            const user = (req.session as any).user;
            if (!user || user.role !== UserRole.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - Only admins can assign multiple courses at once"
                });
            }
            
            // Find the lecturer
            const lecturer = await AppDataSource.getRepository(Lecturer).findOne({
                where: { id: lecturer_id },
                relations: ["courses"]
            });
            
            if (!lecturer) {
                return res.status(404).json({
                    success: false,
                    message: "Lecturer not found"
                });
            }
            
            // Find all courses by IDs
            const courses = await AppDataSource.getRepository(Course).findByIds(course_ids);
            
            if (courses.length !== course_ids.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more courses not found"
                });
            }
            
            // Get current course IDs
            const currentCourseIds = lecturer.courses.map(c => c.id);
            
            // Filter out courses that are already assigned
            const newCourses = courses.filter(c => !currentCourseIds.includes(c.id));
            
            if (newCourses.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "All specified courses are already assigned to this lecturer"
                });
            }
            
            // Add new courses to lecturer
            lecturer.courses = [...lecturer.courses, ...newCourses];
            await AppDataSource.getRepository(Lecturer).save(lecturer);
            
            return res.status(200).json({
                success: true,
                message: `${newCourses.length} course(s) assigned successfully`,
                courses: lecturer.courses
            });
        } catch (error) {
            console.error("Error assigning courses to lecturer:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get course assignments for all lecturers (admin only)
    static async getAllCourseAssignments(req: Request, res: Response) {
        try {
            // Check authorization (admin only)
            const user = (req.session as any).user;
            if (!user || user.role !== UserRole.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - Only admins can view all course assignments"
                });
            }
            
            // Get all lecturers with their course assignments
            const lecturers = await AppDataSource.getRepository(Lecturer).find({
                relations: ["courses"]
            });
            
            // Format the response
            const assignments = lecturers.map(lecturer => ({
                lecturer: {
                    id: lecturer.id,
                    name: lecturer.name,
                    email: lecturer.email
                },
                courses: lecturer.courses.map(course => ({
                    id: course.id,
                    code: course.code,
                    name: course.name,
                    semester: course.semester,
                    year: course.year
                }))
            }));
            
            return res.status(200).json({
                success: true,
                assignments
            });
        } catch (error) {
            console.error("Error fetching all course assignments:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

// CR PART
// - Store all the filters in the lecturers table ; initialise all to default, when changed it can update?? then can pull it to load on page
// - FIlter by: candidates name FIRST (alphabetic order)        ORDER BY
// - Filter by type of session applied for (tut or lab assistant)
// - Filter by availabilty (fulltime/partime) selection
// - Filrer by skill set - ALL BECOME OPTIONS IN A MULTISELECT DROPDOWN
// - controller, route, sservice

// DI PART
// - Store all details in db
// - API backend handles all db operations
// - Form validation stays on react
// - validation in backedn/ REST API

// Questions
// - '@/lib/applicantList' does not exist but is being used?
// - Where should the filter and visual rep be stored? Should i create a new field in the table?
// - Fltering (based on assignment 1) - Exact implication (I can see this if the website is up again)
// - DB has new table? no input? delete?
// - Am I validating in my Controllers?