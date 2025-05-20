// Course routes
// - GET /: Get all courses (with optional filters)
// - GET /:id: Get a single course
// - POST /: Create a new course (admin only)
// - PUT /:id: Update a course (admin only)
// - DELETE /:id: Delete a course (admin only)
// - GET /lecturer/:id: Get courses for a lecturer
import { Router } from "express";
import { CourseController } from "../controller/CourseController";
import { isAuthenticated, hasRole } from "../middleware/authMiddleware";
import { UserRole } from "../entity/User";

const router = Router();

// GET: Get all courses - accessible to all authenticated users
router.get("/", isAuthenticated, async (req, res) => {
    await CourseController.getAllCourses(req, res);
});

// GET: Get a single course by ID - accessible to all authenticated users
router.get("/:id", isAuthenticated, async (req, res) => {
    await CourseController.getCourseById(req, res);
});

// GET: Get courses for a lecturer - accessible to the specific lecturer or admin
router.get("/lecturer/:lecturer_id", isAuthenticated, async (req, res) => {
    // Get the user from the session
    const user = (req.session as any).user;
    
    // If user is admin or the specified lecturer, allow access
    if (user.role === UserRole.ADMIN || user.id === req.params.lecturer_id) {
        await CourseController.getCoursesForLecturer(req, res);
    } else {
        return res.status(403).json({
            success: false,
            message: 'Forbidden. You do not have permission to access this resource.'
        });
    }
});

// POST: Create a new course - admin only
router.post("/", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    await CourseController.createCourse(req, res);
});

// PUT: Update a course - admin only
router.put("/:id", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    await CourseController.updateCourse(req, res);
});

// DELETE: Delete a course - admin only
router.delete("/:id", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    await CourseController.deleteCourse(req, res);
});

export default router;