// backend/src/routes/lecturerCourse.routes.ts
import { Router } from "express";
import { LecturerCourseController } from "../controller/LecturerCourseController";
import { isAuthenticated, hasRole } from "../middleware/authMiddleware";
import { UserRole } from "../entity/User";

const router = Router();

// POST: Add course to lecturer
router.post("/add", isAuthenticated, hasRole([UserRole.ADMIN, UserRole.LECTURER]), async (req, res) => {
    // Ensure lecturers can only modify their own courses
    const user = (req.session as any).user;
    if (user.role === UserRole.LECTURER && user.id !== req.body.lecturer_id) {
        return res.status(403).json({
            success: false,
            message: "Forbidden: You can only modify your own courses"
        });
    }
    
    await LecturerCourseController.addCourseToLecturer(req, res);
});

// POST: Remove course from lecturer
router.post("/remove", isAuthenticated, hasRole([UserRole.ADMIN, UserRole.LECTURER]), async (req, res) => {
    // Ensure lecturers can only modify their own courses
    const user = (req.session as any).user;
    if (user.role === UserRole.LECTURER && user.id !== req.body.lecturer_id) {
        return res.status(403).json({
            success: false,
            message: "Forbidden: You can only modify your own courses"
        });
    }
    
    await LecturerCourseController.removeCourseFromLecturer(req, res);
});

// GET: Get all available courses
router.get("/available", isAuthenticated, hasRole([UserRole.ADMIN, UserRole.LECTURER]), async (req, res) => {
    await LecturerCourseController.getAvailableCourses(req, res);
});

// GET: Get lecturers for a course
router.get("/course/:course_id/lecturers", isAuthenticated, async (req, res) => {
    await LecturerCourseController.getLecturersForCourse(req, res);
});

// POST: Assign multiple courses to a lecturer (admin only)
router.post("/assign-multiple", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    await LecturerCourseController.assignCoursesToLecturer(req, res);
});

// GET: Get all course assignments (admin only)
router.get("/all-assignments", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    await LecturerCourseController.getAllCourseAssignments(req, res);
});

export default router;