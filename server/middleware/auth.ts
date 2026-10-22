import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepo } from '../db/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'newsverify-production-hmac-sha256-key-default-2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
    name: string;
  };
}

export function generateToken(payload: { id: string; email: string; role: 'user' | 'admin'; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Missing Bearer token in Authorization header.'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'user' | 'admin'; name: string };
    const user = await UserRepo.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Session expired or user record no longer exists.'
      });
      return;
    }

    req.user = {
      id: (user as any)._id?.toString() || decoded.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    next();
  } catch (err: any) {
    res.status(403).json({
      success: false,
      error: 'Invalid or expired authentication token.'
    });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Forbidden. Administrator authorization required for this operation.'
    });
    return;
  }
  next();
}
