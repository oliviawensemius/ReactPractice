// backend/src/routes/statistics.routes.ts
import { Router } from "express";
import { StatisticsController } from "../controller/StatisticsController";
import { isAuthenticated, hasRole } from "../middleware/authMiddleware";
import { UserRole } from "../entity/User";

const router = Router();

// GET: Get applicant statistics for a lecturer
router.get("/lecturer/:lecturer_id", isAuthenticated, async (req, res) => {
    // Get the user from the session
    const user = (req.session as any).user;
    
    // If user is admin or the specified lecturer, allow access
    if (user.role === UserRole.ADMIN || user.id === req.params.lecturer_id) {
        await StatisticsController.getLecturerApplicantStatistics(req, res);
    } else {
        return res.status(403).json({
            success: false,
            message: 'Forbidden. You do not have permission to access this resource.'
        });
    }
});

// GET: Get statistics for a specific course
router.get("/course/:course_id", isAuthenticated, hasRole([UserRole.LECTURER, UserRole.ADMIN]), async (req, res) => {
    await StatisticsController.getCourseStatistics(req, res);
});

// GET: Get system-wide statistics (admin only)
router.get("/system", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    await StatisticsController.getSystemStatistics(req, res);
});

export default router;