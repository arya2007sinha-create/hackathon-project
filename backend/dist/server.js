"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const server = app_1.default.listen(env_1.config.port, () => {
    logger_1.logger.info(`=================================================`);
    logger_1.logger.info(`  PRIORA Enterprise Work Orchestration Server    `);
    logger_1.logger.info(`  Listening on port: ${env_1.config.port}              `);
    logger_1.logger.info(`  Environment: ${env_1.config.nodeEnv}                 `);
    logger_1.logger.info(`  Health Check: http://localhost:${env_1.config.port}/health`);
    logger_1.logger.info(`=================================================`);
});
// Graceful Shutdown
const handleShutdown = (signal) => {
    logger_1.logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
        logger_1.logger.info('HTTP server closed.');
        process.exit(0);
    });
};
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
