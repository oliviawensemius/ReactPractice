// Application routes
// - GET /: Get all applications (with filters)
// - GET /:id: Get a single application
// - POST /: Create a new application
// - PUT /:id: Update application status
// - DELETE /:id: Delete an application
// - GET /tutor/:id: Get applications for a tutor
// - GET /course/:id: Get applications for a course
// - POST /:id/comments: Add a comment to an application


// ----------------NOTES----------------
// - ln 64 is patch but should it be delete becasue we are deleting a comment???
import { Router } from "express";
import { ApplicationController } from "../controller/ApplicationController";

const router = Router();

// POST: Create a new application
router.post("/", async (req, res) => {
    await ApplicationController.createApplication(req, res);
});

// GET: Get all applications (with optional filters)
router.get("/", async (req, res) => {
    await ApplicationController.getAllApplications(req, res);
});

// GET: Get a single application by ID
router.get("/:id", async (req, res) => {
    await ApplicationController.getApplicationById(req, res);
});

// GET: Get applications for a specific candidate
router.get("/candidate/:candidate_id", async (req, res) => {
    await ApplicationController.getApplicationsByCandidate(req, res);
});

// GET: Get applications for a specific course
router.get("/course/:course_id", async (req, res) => {
    await ApplicationController.getApplicationsByCourse(req, res);
});

// GET: Get applications by session type
router.get("/session-type/:session_type_id", async (req, res) => {
    await ApplicationController.getApplicationsBySessionType(req, res);
});

// PATCH: Update application status
router.patch("/:id/status", async (req, res) => {
    await ApplicationController.updateApplicationStatus(req, res);
});

// PATCH: Update application ranking
router.patch("/:id/ranking", async (req, res) => {
    await ApplicationController.updateApplicationRanking(req, res);
});

// PATCH: Add comment to application
router.patch("/:id/comments", async (req, res) => {
    await ApplicationController.addComment(req, res);
});

// DELETE: Delete comment from application
router.delete("/:id/comments", async (req, res) => {
    await ApplicationController.deleteComment(req, res);
});

// DELETE: Delete application
router.delete("/:id", async (req, res) => {
    await ApplicationController.deleteApplication(req, res);
});

export default router;