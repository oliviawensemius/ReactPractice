// Course routes
// - GET /: Get all courses (with optional filters)
// - GET /:id: Get a single course
// - POST /: Create a new course (admin only)
// - PUT /:id: Update a course (admin only)
// - DELETE /:id: Delete a course (admin only)
// - GET /lecturer/:id: Get courses for a lecturer
import { Router } from "express";
import { CourseController } from "../controller/CourseController";

const router = Router();

// GET: Get all courses
router.get("/", async (req, res) => {
    await CourseController.getAllCourses(req, res);
});

// GET: Get a single course by ID
router.get("/:id", async (req, res) => {
    await CourseController.getCourseById(req, res);
});

// GET: Get courses for a lecturer
router.get("/lecturer/:lecturer_id", async (req, res) => {
    await CourseController.getCoursesForLecturer(req, res);
});

// POST: Create a new course (admin only)
router.post("/", async (req, res) => {
    await CourseController.createCourse(req, res);
});

// PUT: Update a course (admin only)
router.put("/:id", async (req, res) => {
    await CourseController.updateCourse(req, res);
});

// DELETE: Delete a course (admin only)
router.delete("/:id", async (req, res) => {
    await CourseController.deleteCourse(req, res);
});

export default router;