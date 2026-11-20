import { Request, Response, NextFunction } from 'express';
import { Role } from '../../types/library';

/**
 * Middleware: Require specific role ('student' or 'librarian')
 */
export function requireRole(allowedRole: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED',
        message: 'Authentification requise.',
      });
      return;
    }

    if (req.user.role !== allowedRole) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Action réservée au rôle ${allowedRole}.`,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware: Protect private student data.
 * Students can only read/mutate their own records; librarians can read all.
 */
export function requireOwnershipOrLibrarian(getStudentId: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
      return;
    }

    if (req.user.role === 'librarian') {
      next();
      return;
    }

    const targetStudentId = getStudentId(req);
    if (!targetStudentId || targetStudentId !== req.user.id) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'PRIVATE_DATA_PROTECTED',
        message: 'Vous ne pouvez consulter que vos propres données d’emprunts et de réservations.',
      });
      return;
    }

    next();
  };
}
