"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
(0, vitest_1.describe)('PRIORA Backend API Test Suite', () => {
    let employeeToken = '';
    let managerToken = '';
    (0, vitest_1.it)('1. GET /health should return 200 and ok status', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/health');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.status).toBe('ok');
        (0, vitest_1.expect)(res.body.service).toContain('PRIORA');
    });
    (0, vitest_1.it)('2. POST /api/auth/login with valid employee credentials should authenticate via bcrypt and return JWT', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'rahul.sharma@northstar.io',
            password: 'Employee123!',
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.token).toBeDefined();
        (0, vitest_1.expect)(res.body.data.user.email).toBe('rahul.sharma@northstar.io');
        (0, vitest_1.expect)(res.body.data.user.role).toBe('employee');
        (0, vitest_1.expect)(res.body.data.user.password_hash).toBeUndefined(); // NEVER EXPOSE HASH!
        employeeToken = res.body.data.token;
    });
    (0, vitest_1.it)('3. POST /api/auth/login with valid manager credentials should return manager JWT', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'sarah.chen@northstar.io',
            password: 'Manager123!',
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.token).toBeDefined();
        (0, vitest_1.expect)(res.body.data.user.role).toBe('manager');
        managerToken = res.body.data.token;
    });
    (0, vitest_1.it)('4. POST /api/auth/login with invalid password should fail', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'rahul.sharma@northstar.io',
            password: 'WrongPassword!',
        });
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
    (0, vitest_1.it)('5. GET /api/employee/dashboard should return Next Best Action and Yesterday summary', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/employee/dashboard')
            .set('Authorization', `Bearer ${employeeToken}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.employee.name).toBe('Rahul Sharma');
        (0, vitest_1.expect)(res.body.data.nextBestAction).toBeDefined();
        // Task #6 must be #1 Next Best Action
        (0, vitest_1.expect)(res.body.data.nextBestAction.title).toContain('Payment API');
        (0, vitest_1.expect)(res.body.data.nextBestAction.rank).toBe(1);
        (0, vitest_1.expect)(res.body.data.yesterday.completed).toBe(7);
        (0, vitest_1.expect)(res.body.data.yesterday.carriedForward).toBe(2);
    }, 20000);
    (0, vitest_1.it)('6. Employee should be forbidden from accessing Management dashboard', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/management/dashboard')
            .set('Authorization', `Bearer ${employeeToken}`);
        (0, vitest_1.expect)(res.status).toBe(403);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(res.body.error.code).toBe('FORBIDDEN');
    });
    (0, vitest_1.it)('7. Manager accessing Management dashboard should see 5 teams, Operations Needs Attention, and Early Warning', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/management/dashboard')
            .set('Authorization', `Bearer ${managerToken}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.teamHealth.length).toBe(5);
        const ops = res.body.data.teamHealth.find((t) => t.name === 'Operations');
        (0, vitest_1.expect)(ops).toBeDefined();
        (0, vitest_1.expect)(ops.healthStatus).toBe('NEEDS_ATTENTION');
        (0, vitest_1.expect)(ops.actualProgress).toBeGreaterThanOrEqual(0);
        (0, vitest_1.expect)(res.body.data.earlyWarning.teamName).toBe('Operations');
        (0, vitest_1.expect)(res.body.data.earlyWarning.delta).toBeGreaterThan(10);
    }, 20000);
    (0, vitest_1.it)('8. POST /api/ai/insights should respond using live DB data with deterministic fallback', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/ai/insights')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({ query: 'Which teams need attention today?' });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.answer).toBeDefined();
        (0, vitest_1.expect)(res.body.data.answer.toLowerCase()).toContain('operations');
    });
});
