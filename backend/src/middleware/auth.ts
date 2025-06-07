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
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session.userId) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in.'
    });
    return;
  }
  next();
};

// Middleware to check specific roles
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const userRole = req.session.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
      return;
    }

    next();
  };
};

// Middleware to attach user to request (for authenticated routes)
export const attachUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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