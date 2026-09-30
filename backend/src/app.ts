import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
    credentials: true,
  })
);

// Rate limiter for API endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // max 500 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
});
app.use('/api', limiter);

// Body Parsers & Logging
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Health Check Endpoint (Render & Monitoring requirement)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PRIORA Enterprise Work Orchestration API',
  });
});

// Root ping
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'PRIORA API Service is active',
    version: '1.0.0',
    documentation: '/api',
  });
});

// Mount Central API Routes
app.use('/api', routes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
