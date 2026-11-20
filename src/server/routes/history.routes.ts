import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/database';
import { z } from 'zod';
import { SearchHistoryEntry } from '../../types/library';

export const historyRouter = Router();

const addQuerySchema = z.object({
  query: z.string().min(1),
  category: z.string().optional(),
  resultsCount: z.number().int().nonnegative().optional(),
});

/**
 * GET /api/history
 */
historyRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const history = db.searchHistory.get(user.id) || [];
    res.json({ data: history });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/history
 */
historyRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { query, category, resultsCount } = addQuerySchema.parse(req.body);

    const newEntry: SearchHistoryEntry = {
      id: `sh_${Date.now()}`,
      query: query.trim(),
      filterCategory: category,
      timestamp: 'À l’instant',
      resultsCount: resultsCount || 0,
    };

    const current = db.searchHistory.get(user.id) || [];
    const updated = [
      newEntry,
      ...current.filter((item) => item.query.toLowerCase() !== query.toLowerCase()).slice(0, 9),
    ];
    db.searchHistory.set(user.id, updated);

    res.status(201).json({ data: newEntry });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/history
 */
historyRouter.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    db.searchHistory.set(user.id, []);
    res.json({ message: 'Historique de recherche vidé.' });
  } catch (error) {
    next(error);
  }
});
