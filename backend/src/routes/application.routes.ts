// backend/src/routes/application.routes.ts
import { Router, Request, Response, NextFunction } from "express";
import { ApplicationController } from "../controller/ApplicationController";
import { isAuthenticated, hasRole } from "../middleware/authMiddleware";
import { UserRole } from "../entity/User";

const router = Router();

// POST: Create a new application (candidates only)
router.post("/", 
  isAuthenticated, 
  hasRole(UserRole.CANDIDATE), 
  (req: Request, res: Response) => ApplicationController.createApplication(req, res)
);

// GET: Get all applications (with optional filters) - lecturers and admins only
router.get("/", 
  isAuthenticated, 
  hasRole([UserRole.LECTURER, UserRole.ADMIN]), 
  (req: Request, res: Response) => ApplicationController.getAllApplications(req, res)
);

// GET: Get a single application by ID
router.get("/:id", 
  isAuthenticated, 
  (req: Request, res: Response) => ApplicationController.getApplicationById(req, res)
);

// GET: Get applications for a specific candidate
router.get("/candidate/:candidate_id", 
  isAuthenticated, 
  (req: Request, res: Response) => ApplicationController.getApplicationsByCandidate(req, res)
);

// GET: Get applications for a specific course
router.get("/course/:course_id", 
  isAuthenticated, 
  hasRole([UserRole.LECTURER, UserRole.ADMIN]), 
  (req: Request, res: Response) => ApplicationController.getApplicationsByCourse(req, res)
);

// GET: Get applications by session type
router.get("/session-type/:session_type_id", 
  isAuthenticated, 
  hasRole([UserRole.LECTURER, UserRole.ADMIN]), 
  (req: Request, res: Response) => ApplicationController.getApplicationsBySessionType(req, res)
);

// PATCH: Update application status - lecturers and admins only
router.patch("/:id/status", 
  isAuthenticated, 
  hasRole([UserRole.LECTURER, UserRole.ADMIN]), 
  (req: Request, res: Response) => ApplicationController.updateApplicationStatus(req, res)
);

// PATCH: Update application ranking - lecturers and admins only
router.patch("/:id/ranking", 
  isAuthenticated, 
  hasRole([UserRole.LECTURER, UserRole.ADMIN]), 
  (req: Request, res: Response) => ApplicationController.updateApplicationRanking(req, res)
);

// PATCH: Add comment to application - lecturers and admins only
router.patch("/:id/comments", 
  isAuthenticated, 
  hasRole([UserRole.LECTURER, UserRole.ADMIN]), 
  (req: Request, res: Response) => ApplicationController.addComment(req, res)
);

// DELETE: Delete comment from application - lecturers and admins only
router.delete("/:id/comments", 
  isAuthenticated, 
  hasRole([UserRole.LECTURER, UserRole.ADMIN]), 
  (req: Request, res: Response) => ApplicationController.deleteComment(req, res)
);

// DELETE: Delete application - admins or the candidate who created it
router.delete("/:id", 
  isAuthenticated, 
  (req: Request, res: Response) => ApplicationController.deleteApplication(req, res)
);

export default router;