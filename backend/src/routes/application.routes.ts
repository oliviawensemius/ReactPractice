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

// POST: submit application
router.post("/", async (req, res) => {
    await ApplicationController.createApplication(req, res);
}
); 

// GET: get all applications
router.get("/", async (req, res) => {
    await ApplicationController.getAllApplications(req, res);
}
);

// GET: get all applications by id
router.get("/:id", async (req, res) => {
    await ApplicationController.getApplicationById(req, res);
}
);

// GET: get all applications by candidate
router.get("/candidate/:candidateId", async (req, res) => {
    await ApplicationController.getApplicationsByCandidate(req, res);
}
);

// GET: get all applications by course
router.get("/course/:courseId", async (req, res) => {
    await ApplicationController.getApplicationsByCourse(req, res);
}
);

// PATCH : update application status
router.patch("/:id/status", async (req, res) => {
    await ApplicationController.updateApplicationStatus(req, res);
}
);

// PATCH : add comment
router.patch("/:id/comments", async (req, res) => {
    await ApplicationController.addComment(req, res);
}
);

// DELETE : delete commenth
router.delete("/:id/comments", async (req, res) => {
    await ApplicationController.deleteComment(req, res);
}
);

// DELETE: delete application
router.delete("/:id", async (req, res) => {
    await ApplicationController.deleteApplication(req, res);
}
);




