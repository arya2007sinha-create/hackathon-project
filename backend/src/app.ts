import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

import path from 'path';
import fs from 'fs';

const app = express();

// Security Middlewares - CSP disabled to permit bundled Vite assets & inline icons
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// Mount Central API Routes first
app.use('/api', routes);

// Check potential paths for frontend dist bundle
const candidateDistPaths = [
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, './public'),
  path.resolve(process.cwd(), 'public'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
];
const frontendDist = candidateDistPaths.find((p) => fs.existsSync(p));

if (frontendDist) {
  // Serve static assets (js, css, images)
  app.use(express.static(frontendDist));

  // SPA fallback: any non-API route returns index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Fallback API ping if frontend dist not yet built
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'PRIORA API Service is active',
      version: '1.0.0',
      documentation: '/api',
    });
  });
}

// Centralized Error Handling
app.use(errorHandler);

export default app;
