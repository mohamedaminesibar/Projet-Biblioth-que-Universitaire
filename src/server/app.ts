import express from 'express';
import { authenticate } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { booksRouter } from './routes/books.routes';
import { authRouter } from './routes/auth.routes';
import { loansRouter } from './routes/loans.routes';
import { reservationsRouter } from './routes/reservations.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { notificationsRouter } from './routes/notifications.routes';
import { historyRouter } from './routes/history.routes';
import { aiRouter } from './routes/ai.routes';

export function createApp() {
  const app = express();

  // Basic middlewares
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'BiblioEST Backend API',
      timestamp: new Date().toISOString(),
      institution: 'EST Fès / USMBA',
    });
  });

  // Public Books Catalog & Authentication routes
  app.use('/api/books', booksRouter);
  app.use('/api/auth', authRouter);

  // Global authentication middleware for other protected /api/* endpoints
  app.use('/api', (req, res, next) => {
    if (req.path === '/health' || req.path.startsWith('/auth')) return next();
    authenticate(req, res, next);
  });

  // Mount protected feature routers
  app.use('/api/loans', loansRouter);
  app.use('/api/reservations', reservationsRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/history', historyRouter);
  app.use('/api/ai', aiRouter);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
