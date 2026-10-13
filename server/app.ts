import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.ts';
import { connectDB } from './db.ts';
import { errorHandler, notFound } from './lib/http.ts';
import applicationRoutes from './modules/applications/routes.ts';
import authRoutes from './modules/auth/routes.ts';
import companyRoutes from './modules/companies/routes.ts';
import internshipRoutes from './modules/internships/routes.ts';
import messageRoutes from './modules/messages/routes.ts';
import notificationRoutes from './modules/notifications/routes.ts';
import profileRoutes from './modules/profiles/routes.ts';

export function createApp() {
  const config = env();
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  // Defaults, plus what Google's sign-in button needs when this server also serves the built frontend.
  const gsi = 'https://accounts.google.com/gsi/';
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'script-src': ["'self'", `${gsi}client`],
          'frame-src': ["'self'", gsi],
          'connect-src': ["'self'", gsi],
          'style-src': ["'self'", 'https:', "'unsafe-inline'", `${gsi}style`],
        },
      },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  if (config.NODE_ENV === 'development') app.use(morgan('dev'));

  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      skip: () => config.NODE_ENV === 'test',
      message: { error: 'Too many requests. Slow down a little.' },
    }),
  );

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // On serverless each cold start needs a connection; connectDB() is a no-op once connected.
  app.use('/api', async (_req, _res, next) => {
    await connectDB();
    next();
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/companies', companyRoutes);
  app.use('/api/internships', internshipRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/conversations', messageRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.use('/api', (_req, _res, next) => next(notFound('Endpoint')));
  app.use(errorHandler);

  return app;
}
