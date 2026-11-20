import { Router, Request, Response, NextFunction } from 'express';
import { loanService } from '../services/loan.service';
import { requireRole } from '../middleware/rbac';
import { z } from 'zod';

export const loansRouter = Router();

const borrowSchema = z.object({
  copyBarcode: z.string().min(3),
});

/**
 * GET /api/loans
 * Filtered automatically according to user role (students only get their loans)
 */
loansRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const severity = req.query.severity as any;

    const loans = await loanService.getLoans(user, severity);
    res.json({ data: loans, total: loans.length });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/loans/borrow
 * Student borrows an available copy
 */
loansRouter.post('/borrow', requireRole('student'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { copyBarcode } = borrowSchema.parse(req.body);
    const user = req.user!;

    const loan = await loanService.borrowCopy(user.id, copyBarcode);
    res.status(201).json({
      message: 'Emprunt enregistré avec succès.',
      data: loan,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/loans/:id/return
 * Closes the loan and frees physical copy or allocates to FIFO queue (Librarian only)
 */
loansRouter.post('/:id/return', requireRole('librarian'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const result = await loanService.returnLoan(req.params.id, user);

    res.json({
      message: 'Restitution physique enregistrée et emprunt clôturé avec succès.',
      data: result.loan,
      nextReservationAllocated: result.nextReservationAllocated,
    });
  } catch (error) {
    next(error);
  }
});
