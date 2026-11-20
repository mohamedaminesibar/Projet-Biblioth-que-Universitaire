import { Router, Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { db } from '../db/database';
import { loanService } from '../services/loan.service';
import { z } from 'zod';

export const aiRouter = Router();

const recommendationsSchema = z.object({
  currentBookId: z.string().min(1),
});

const draftNotificationSchema = z.object({
  loanId: z.string().min(1),
});

/**
 * POST /api/ai/recommendations
 * Generates verified, grounded recommendations from the closed catalog
 */
aiRouter.post('/recommendations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentBookId } = recommendationsSchema.parse(req.body);
    const user = req.user;

    const recommendations = await aiService.getGroundedRecommendations({
      currentBookId,
      studentId: user?.id,
    });

    res.json({
      data: recommendations,
      total: recommendations.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/draft-notification
 * Generates a tailored notification text grounded on true database dates and severity
 */
aiRouter.post('/draft-notification', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loanId } = draftNotificationSchema.parse(req.body);

    const loan = db.loans.get(loanId);
    if (!loan) {
      res.status(404).json({
        error: 'Not Found',
        code: 'LOAN_NOT_FOUND',
        message: 'Emprunt introuvable.',
      });
      return;
    }

    if (loan.status === 'returned') {
      res.status(400).json({
        error: 'Bad Request',
        code: 'LOAN_ALREADY_RETURNED',
        message: 'Cet emprunt est déjà clôturé. Aucune relance ne peut être rédigée.',
      });
      return;
    }

    // Reliable delay calculation directly from database date
    const { daysOverdue, severity } = loanService.calculateDelay(loan.dueDate);

    const draft = await aiService.draftGradedNotification({
      studentName: loan.studentName,
      studentFiliere: loan.studentFiliere,
      bookTitle: loan.bookTitle,
      daysOverdue,
      severity,
    });

    res.json({
      data: {
        ...draft,
        loanId: loan.id,
        daysOverdue,
        severity,
        recipientEmail: loan.studentEmail,
        recipientName: loan.studentName,
      },
    });
  } catch (error) {
    next(error);
  }
});
