import { Router, Request, Response, NextFunction } from 'express';
import { reservationService } from '../services/reservation.service';
import { requireRole } from '../middleware/rbac';
import { z } from 'zod';

export const reservationsRouter = Router();

const createReservationSchema = z.object({
  bookId: z.string().min(1),
});

/**
 * GET /api/reservations
 */
reservationsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const bookId = req.query.bookId as string | undefined;

    const list = await reservationService.getReservations(user, bookId);
    res.json({ data: list, total: list.length });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reservations
 * Student joins FIFO queue for an unavailable book
 */
reservationsRouter.post('/', requireRole('student'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookId } = createReservationSchema.parse(req.body);
    const user = req.user!;

    const reservation = await reservationService.createReservation(user, bookId);
    res.status(201).json({
      message: 'Inscription dans la file d’attente FIFO confirmée.',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/reservations/:id
 * Cancels a reservation
 */
reservationsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    await reservationService.cancelReservation(user, req.params.id);

    res.json({
      message: 'Réservation annulée avec succès.',
    });
  } catch (error) {
    next(error);
  }
});
