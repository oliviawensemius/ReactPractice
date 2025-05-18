// src/routes/auth.routes.ts

import { Router } from "express";
import { AuthController } from "../controller/AuthController";

const router = Router();

// sign up
router.post("/signup", async (req, res) => {
    await AuthController.signup(req, res);
});

// sign in
router.post("/signin", async (req, res) => {
    await AuthController.signin(req, res);
});

// get profile
router.get("/profile", async (req, res) => {
    await AuthController.getProfile(req, res);
});

// logout
router.post("/logout", async (req, res) => {
    await AuthController.logout(req, res);
});

export default router;