"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
// Security Middlewares - CSP disabled to permit bundled Vite assets & inline icons
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: env_1.config.corsOrigin === '*' ? true : env_1.config.corsOrigin.split(','),
    credentials: true,
}));
// Rate limiter for API endpoints
const limiter = (0, express_rate_limit_1.default)({
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
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
if (env_1.config.nodeEnv !== 'test') {
    app.use((0, morgan_1.default)('combined'));
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
app.use('/api', routes_1.default);
// Check potential paths for frontend dist bundle
const candidateDistPaths = [
    path_1.default.resolve(__dirname, '../../frontend/dist'),
    path_1.default.resolve(__dirname, '../frontend/dist'),
    path_1.default.resolve(process.cwd(), 'frontend/dist'),
    path_1.default.resolve(process.cwd(), '../frontend/dist'),
];
const frontendDist = candidateDistPaths.find((p) => fs_1.default.existsSync(p));
if (frontendDist) {
    // Serve static assets (js, css, images)
    app.use(express_1.default.static(frontendDist));
    // SPA fallback: any non-API route returns index.html for client-side routing
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(frontendDist, 'index.html'));
    });
}
else {
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
app.use(error_middleware_1.errorHandler);
exports.default = app;
