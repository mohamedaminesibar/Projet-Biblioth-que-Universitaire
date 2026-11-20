import { Router, Request, Response, NextFunction } from 'express';
import { catalogService } from '../services/catalog.service';

export const booksRouter = Router();

/**
 * GET /api/books
 * Query params: query, category, onlyAvailable, sortBy
 */
booksRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, category, onlyAvailable, sortBy } = req.query;

    const books = await catalogService.searchBooks({
      query: query as string | undefined,
      category: category as string | undefined,
      onlyAvailable: onlyAvailable === 'true',
      sortBy: sortBy as any,
    });

    res.json({
      data: books,
      total: books.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/books/:id
 */
booksRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await catalogService.getBookById(req.params.id);
    if (!book) {
      res.status(404).json({
        error: 'Not Found',
        code: 'BOOK_NOT_FOUND',
        message: 'Ouvrage introuvable dans le fonds documentaire EST.',
      });
      return;
    }
    res.json({ data: book });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/books/:id/copies
 */
booksRouter.get('/:id/copies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const copies = await catalogService.getCopiesForBook(req.params.id);
    res.json({ data: copies });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/books/:id/similar
 */
booksRouter.get('/:id/similar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const similar = await catalogService.getSimilarBooks(req.params.id);
    res.json({ data: similar });
  } catch (error) {
    next(error);
  }
});
