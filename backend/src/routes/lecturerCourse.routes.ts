// backend/src/routes/lecturerCourse.routes.ts
import { Router } from "express";
import { LecturerCourseController } from "../controller/LecturerCourseController";

const router = Router();

// POST: Add course to lecturer
router.post("/add", async (req, res) => {
    await LecturerCourseController.addCourseToLecturer(req, res);
});

// POST: Remove course from lecturer
router.post("/remove", async (req, res) => {
    await LecturerCourseController.removeCourseFromLecturer(req, res);
});

// GET: Get all available courses
router.get("/available", async (req, res) => {
    await LecturerCourseController.getAvailableCourses(req, res);
});

export default router;