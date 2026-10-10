import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

// Fallback environment settings (Ensures server works even if AI Studio clears .env)
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://wk2048_db_user:wk123456@cluster0.wray9yc.mongodb.net/worknest_ajao?retryWrites=true&w=majority";
process.env.JWT_SECRET = process.env.JWT_SECRET || "worknest_secret_jwt_key_pakistan_2026";

// Database initialization
import { connectDB, seedDefaultData } from './server/db.ts';

// Route imports
import authRoutes from './server/routes/auth.ts';
import internshipRoutes from './server/routes/internships.ts';
import aiRoutes from './server/routes/ai.ts';
import chatRoutes from './server/routes/chat.ts';
import paymentRoutes from './server/routes/payments.ts';
import devRoutes from './server/routes/dev.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  // Populate in-memory dataset immediately so requests never block
  seedDefaultData();

  // Connect to live MongoDB Atlas asynchronously in background
  connectDB().catch((err) => {
    console.log('[WorkNest DB] Live DB background connection notice:', err?.message);
  });

  // Basic security middleware
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate Limiting for API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests sent to WorkNest Ajao API. Please try again in a few minutes.',
    },
  });

  app.use('/api/', apiLimiter);

  // Mount REST API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/internships', internshipRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/dev', devRoutes);

  // Root API Discovery endpoint
  app.get('/api', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'WorkNest Ajao REST API',
      description: 'Career platform connecting Pakistani fresh CS/IT graduates with paid virtual internships based purely on portfolio proof-of-work.',
      version: '1.0.0',
      status: 'active',
      endpoints: {
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          me: 'GET /api/auth/me',
          toggleGpaShield: 'PUT /api/auth/toggle-gpa-shield',
        },
        internships: {
          list: 'GET /api/internships?city=Lahore&techStack=React&type=Micro-Task&isRemoteUsd=true',
          getById: 'GET /api/internships/:id',
          create: 'POST /api/internships (Founder only)',
          apply: 'POST /api/internships/:id/apply (Candidate only)',
          applications: 'GET /api/internships/:id/applications',
        },
        ai: {
          auditCode: 'POST /api/ai/audit-code',
        },
        chat: {
          conversation: 'GET /api/chat/conversation/:recipientId',
          send: 'POST /api/chat/send',
        },
        payments: {
          releaseMilestone: 'POST /api/payments/release-milestone (Founder only)',
          wallet: 'GET /api/payments/wallet',
        },
        dev: {
          status: 'GET /api/dev/status',
          dump: 'GET /api/dev/dump',
          resetSeed: 'POST /api/dev/reset-seed',
        },
      },
    });
  });

  // Serve Frontend
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[WorkNest Server] Vite middleware mounted in development mode.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[WorkNest Server] Static SPA files mounted in production mode.');
  }

  // Central error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[WorkNest Server Error]:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 WorkNest Ajao Full-Stack Server running!`);
    console.log(`   URL: http://0.0.0.0:${PORT}`);
    console.log(`   API Docs & Base: http://0.0.0.0:${PORT}/api`);
    console.log(`   Local Time (PKT): ${new Date(Date.now() + 5 * 3600 * 1000).toISOString().replace('Z', '+05:00')}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error in server.ts:', err);
  process.exit(1);
});
