import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGINS,
  credentials: true,
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic brute-force protection on authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});
app.use('/api/auth', authLimiter);

app.use('/api', routes);

app.get('/', (_req, res) => {
  res.json({ message: 'Journal Management System API is running' });
});

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Centralized error handler — keeps stack traces out of production responses
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

async function startServer() {
  await connectDatabase();

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`API server listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
