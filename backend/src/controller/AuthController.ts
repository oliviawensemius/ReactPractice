// src/controller/AuthController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User";
import { Candidate } from "../entity/Candidate";
import { Lecturer } from "../entity/Lecturer";
import { Admin } from "../entity/Admin";
import * as bcrypt from "bcrypt";
import { validateEmail, validatePassword, validateName, validateRole } from "../utils/validation";

export class AuthController {
    // sign up function

    static async signup(req: Request, res: Response) {
        try {
            const { name, email, password, role } = req.body;

            // Input validations
            const validations = [
                validateName(name || ''),
                validateEmail(email || ''),
                validatePassword(password || ''),
                validateRole(role || '')
            ];

            const errors = validations
                .filter(v => !v.valid)
                .map(v => v.message);

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors
                });
            }

            // check if user exists
            const userRepository = AppDataSource.getRepository(User);
            const existingUser = await userRepository.findOne({ where: { email } });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists with this email"
                });
            }

            //hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            //create role-based user
            let user;

            if (role === UserRole.CANDIDATE) {
                const candidateRepository = AppDataSource.getRepository(Candidate);
                user = candidateRepository.create({
                    name,
                    email,
                    password: hashedPassword,
                    role,
                    skills: [],
                });
                await candidateRepository.save(user);
            } else if (role === UserRole.LECTURER) {
                const lecturerRepository = AppDataSource.getRepository(Lecturer);
                user = lecturerRepository.create({
                    name,
                    email,
                    password: hashedPassword,
                    role,
                    courses: []
                });
                await lecturerRepository.save(user);
            } else if (role === UserRole.ADMIN) {
                const adminRepository = AppDataSource.getRepository(Admin);
                user = adminRepository.create({
                    name,
                    email,
                    password: hashedPassword,
                    role
                });
                await adminRepository.save(user);
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role"
                });
            }

            //ret success message
            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error("Error during signup:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred during registration"
            });
        }
    }

    // sign in

    static async signin(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            // input validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email and password are required"
                });
            }

            // Enhance the query to find users in all tables
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { email } });

            // Log the user query result
            console.log("Found user during signin:", user ? { id: user.id, email: user.email, role: user.role } : null);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            // check if user active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: "Account is blocked. Contact administrator."
                });
            }

            // verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            // Store user in session
            if (req.session) {
                (req.session as any).user = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                };
            }

            // Return user data
            return res.status(200).json({
                success: true,
                message: "Login successful",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                }
            });
        } catch (error) {
            console.error("Error in signin:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred during login"
            });
        }
    }
    // logout
    static async logout(req: Request, res: Response) {
        try {
            // Clear the session
            if (req.session) {
                req.session.destroy((err) => {
                    if (err) {
                        console.error("Error destroying session:", err);
                    }
                });
            }

            return res.status(200).json({
                success: true,
                message: "Logged out successfully"
            });
        } catch (error) {
            console.error("Error in logout:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred during logout"
            });
        }
    }

    static async getProfile(req: Request, res: Response) {
        try {
            // Check authentication
            if (!req.session || !(req.session as any).user) {
                return res.status(401).json({
                    success: false,
                    message: "Not authenticated"
                });
            }
            
            const userId = (req.session as any).user.id;
            
            // find user by id
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id: userId } });
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
            
            // return user profile
            return res.status(200).json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                }
            });
        } catch (error) {
            console.error("Error in getProfile:", error);
            return res.status(500).json({
                success: false,
                message: "Error retrieving user profile"
            });
        }
    }
}