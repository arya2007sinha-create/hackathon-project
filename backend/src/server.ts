import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const server = app.listen(config.port, () => {
  logger.info(`=================================================`);
  logger.info(`  PRIORA Enterprise Work Orchestration Server    `);
  logger.info(`  Listening on port: ${config.port}              `);
  logger.info(`  Environment: ${config.nodeEnv}                 `);
  logger.info(`  Health Check: http://localhost:${config.port}/health`);
  logger.info(`=================================================`);
});

// Graceful Shutdown
const handleShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
