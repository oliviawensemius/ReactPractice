// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../entity/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Extend session data interface
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

// Middleware to check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in.'
    });
  }
  next();
};

// Middleware to check specific roles
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.session.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

// Middleware to attach user to request (for authenticated routes)
export const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    try {
      // You can load full user data here if needed
      // For now, we'll use the session data
      req.user = req.session.user as any;
    } catch (error) {
      console.error('Error attaching user:', error);
    }
  }
  next();
};