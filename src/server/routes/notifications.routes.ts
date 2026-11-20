import { Router, Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { requireRole } from '../middleware/rbac';
import { z } from 'zod';

export const notificationsRouter = Router();

const sendNotificationSchema = z.object({
  loanId: z.string().min(1),
  recipientEmail: z.string().email(),
  recipientName: z.string().min(1),
  bookTitle: z.string().min(1),
  severity: z.enum(['none', 'yellow', 'orange', 'red']),
  subject: z.string().min(3),
  message: z.string().min(5),
  channel: z.enum(['in_app', 'email', 'both']).optional(),
  forceResend: z.boolean().optional(),
});

/**
 * GET /api/notifications
 */
notificationsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const list = await notificationService.getNotifications(user);
    res.json({ data: list, total: list.length });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/send
 * Restricted to librarian, with duplicate and cessation enforcement
 */
notificationsRouter.post('/send', requireRole('librarian'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = sendNotificationSchema.parse(req.body);
    const user = req.user!;

    const result = await notificationService.sendNotification(payload, user);
    res.status(201).json({
      message: 'Notification acheminée avec succès vers l’étudiant.',
      data: result.notification,
      deliveryStatus: result.deliveryStatus,
      providerMessageId: result.providerMessageId,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/read-all
 */
notificationsRouter.post('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    await notificationService.markAllAsRead(user);
    res.json({ message: 'Toutes les notifications ont été marquées comme lues.' });
  } catch (error) {
    next(error);
  }
});
