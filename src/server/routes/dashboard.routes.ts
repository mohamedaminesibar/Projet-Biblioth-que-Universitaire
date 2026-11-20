import { Router, Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { requireRole } from '../middleware/rbac';

export const dashboardRouter = Router();

/**
 * GET /api/dashboard/stats
 * Strictly restricted to librarian
 */
dashboardRouter.get('/stats', requireRole('librarian'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await dashboardService.getMetrics();
    res.json({ data: metrics });
  } catch (error) {
    next(error);
  }
});
