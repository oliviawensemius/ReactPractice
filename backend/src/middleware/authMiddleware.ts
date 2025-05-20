// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UserRole } from '../entity/User';

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session || !(req.session as any).user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized. Please sign in to access this resource.'
    });
    return;
  }
  next();
};

// Middleware to check if user has a specific role
export const hasRole = (roles: UserRole | UserRole[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session || !(req.session as any).user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please sign in to access this resource.'
      });
      return;
    }

    const userRole = (req.session as any).user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.'
      });
      return;
    }
    
    next();
  };
};

// Middleware to check if user is the owner or has admin role
export const isOwnerOrAdmin = (paramIdField: string, getUserIdFunc: (req: Request) => string | undefined): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session || !(req.session as any).user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please sign in to access this resource.'
      });
      return;
    }

    const user = (req.session as any).user;
    
    // If user is admin, allow access
    if (user.role === UserRole.ADMIN) {
      next();
      return;
    }
    
    // Get the user ID associated with the resource
    const resourceUserId = getUserIdFunc(req);
    
    // If user is the owner of the resource, allow access
    if (resourceUserId && resourceUserId === user.id) {
      next();
      return;
    }
    
    // Otherwise, deny access
    res.status(403).json({
      success: false,
      message: 'Forbidden. You do not have permission to access this resource.'
    });
  };
};