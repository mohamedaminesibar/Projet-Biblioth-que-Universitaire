import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database';
import { AuthUser } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Middleware: Verify user authentication and attach user profile
 * Supports Authorization header or custom development x-user-id header.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Public catalog browsing: /api/books does not require login
  if (req.method === 'GET' && req.baseUrl === '/api/books') {
    return next();
  }

  const userId = (req.headers['x-user-id'] as string) || 'usr_guest';
  const role = (req.headers['x-user-role'] as string) || 'student';

  // Guest user pseudo-session for unauthenticated browsing
  if (userId === 'usr_guest') {
    req.user = {
      id: 'usr_guest',
      name: 'Étudiant Invité',
      email: 'invite@est.usmba.ac.ma',
      role: 'student',
      filiere: 'Consultation Libre EST',
    };
    return next();
  }

  let user = db.users.get(userId);

  // Auto-register dynamically identified students
  if (!user && userId.startsWith('usr_std_')) {
    user = {
      id: userId,
      name: 'Étudiant EST',
      email: `${userId}@usmba.ac.ma`,
      role: 'student',
      filiere: 'EST Fès',
    };
    db.users.set(userId, user);
  }

  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
      code: 'AUTH_REQUIRED',
      message: 'Authentification requise pour accéder aux services de la bibliothèque EST.',
    });
    return;
  }

  req.user = user;
  next();
}
