import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../db.ts';

export const JWT_SECRET = process.env.JWT_SECRET || 'worknest_secret_jwt_key_pakistan_2026';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Please sign in to WorkNest Ajao.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    // Look up in database or in-memory fallback
    const user = await dbStore.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.',
      error: error.message,
    });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] roles only.`,
      });
    }
    next();
  };
};

/**
 * Helper to sanitize user object before sending in response,
 * honoring the WorkNest Low-GPA Shield.
 */
export const sanitizeUser = (user: any, requestingUser?: any) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;

  // If candidate has hideGpa enabled and someone else (e.g. founder) is viewing them:
  if (userObj.role === 'candidate' && userObj.hideGpa) {
    const isSelf = requestingUser && String(requestingUser._id) === String(userObj._id);
    if (!isSelf) {
      // Mask GPA and replace with proof-of-work reliability notice
      delete userObj.gpa;
      userObj.gpaShieldActive = true;
      userObj.gpaStatus = 'GPA Shielded by WorkNest (Evaluated purely on verified portfolio & code audits)';
    }
  }

  return userObj;
};
