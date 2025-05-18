import { Router } from "express";
import { ApplicationController } from "../controller/ApplicationController";

const router = Router();

// POST: Create a new application
router.post("/", ApplicationController.createApplication);

// GET: Get all applications (with optional filters)
router.get("/", ApplicationController.getAllApplications);

// GET: Get a single application by ID
router.get("/:id", ApplicationController.getApplicationById);

// GET: Get applications for a specific candidate
router.get("/candidate/:candidate_id", ApplicationController.getApplicationsByCandidate);

// GET: Get applications for a specific course
router.get("/course/:course_id", ApplicationController.getApplicationsByCourse);

// PATCH: Update application status
router.patch("/:id/status", ApplicationController.updateApplicationStatus);

// PATCH: Add comment to application
router.patch("/:id/comments", ApplicationController.addComment);

// DELETE: Delete comment from application
router.delete("/:id/comments", ApplicationController.deleteComment);

// DELETE: Delete application
router.delete("/:id", ApplicationController.deleteApplication);

export default router;