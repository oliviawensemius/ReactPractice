import { Router } from "express";
import { CourseController } from "../controller/CourseController";

const router = Router();

// GET: Get all courses
router.get("/", CourseController.getAllCourses);

// GET: Get a single course by ID
router.get("/:id", CourseController.getCourseById);

// GET: Get courses for a lecturer
router.get("/lecturer/:lecturer_id", CourseController.getCoursesForLecturer);

// POST: Create a new course (admin only)
router.post("/", CourseController.createCourse);

// PUT: Update a course (admin only)
router.put("/:id", CourseController.updateCourse);

// DELETE: Delete a course (admin only)
router.delete("/:id", CourseController.deleteCourse);

export default router;