// backend/src/routes/auth.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Candidate } from '../entity/Candidate';
import { Lecturer } from '../entity/Lecturer';
import { Admin } from '../entity/Admin';
import { validateEmail, validatePassword, validateName, validateRole } from '../utils/validation';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Sign up endpoint
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return res.status(400).json({
        success: false,
        message: nameValidation.message
      });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    const roleValidation = validateRole(role);
    if (!roleValidation.valid) {
      return res.status(400).json({
        success: false,
        message: roleValidation.message
      });
    }

    // Check if user already exists
    const userRepo = AppDataSource.getRepository(User);
    const existingUser = await userRepo.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = userRepo.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    const savedUser = await userRepo.save(user);

    // Create role-specific record
    if (role === 'candidate') {
      const candidateRepo = AppDataSource.getRepository(Candidate);
      const candidate = candidateRepo.create({
        user_id: savedUser.id,
        availability: 'parttime',
        skills: []
      });
      await candidateRepo.save(candidate);
    } else if (role === 'lecturer') {
      const lecturerRepo = AppDataSource.getRepository(Lecturer);
      const lecturer = lecturerRepo.create({
        user_id: savedUser.id,
        department: 'School of Computer Science'
      });
      await lecturerRepo.save(lecturer);
    } else if (role === 'admin') {
      const adminRepo = AppDataSource.getRepository(Admin);
      const admin = adminRepo.create({
        user_id: savedUser.id,
        department: 'IT Administration'
      });
      await adminRepo.save(admin);
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during signup'
    });
  }
});

// Sign in endpoint
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ 
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role', 'is_active', 'created_at']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    // Get additional role-specific data
    let roleSpecificId = null;
    if (user.role === 'candidate') {
      const candidateRepo = AppDataSource.getRepository(Candidate);
      const candidate = await candidateRepo.findOne({ where: { user_id: user.id } });
      roleSpecificId = candidate?.id;
    } else if (user.role === 'lecturer') {
      const lecturerRepo = AppDataSource.getRepository(Lecturer);
      const lecturer = await lecturerRepo.findOne({ where: { user_id: user.id } });
      roleSpecificId = lecturer?.id;
    } else if (user.role === 'admin') {
      const adminRepo = AppDataSource.getRepository(Admin);
      const admin = await adminRepo.findOne({ where: { user_id: user.id } });
      roleSpecificId = admin?.id;
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleSpecificId,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during signin'
    });
  }
});

// Sign out endpoint
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error during logout'
      });
    }

    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// Get current user profile
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ 
      where: { id: req.session.userId },
      select: ['id', 'name', 'email', 'role', 'is_active', 'created_at']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Check authentication status
router.get('/check', (req: Request, res: Response) => {
  if (req.session.userId) {
    res.json({
      success: true,
      authenticated: true,
      user: req.session.user
    });
  } else {
    res.json({
      success: true,
      authenticated: false,
      user: null
    });
  }
});

export default router;