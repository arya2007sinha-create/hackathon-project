import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('PRIORA Backend API Test Suite', () => {
  let employeeToken = '';
  let managerToken = '';

  it('1. GET /health should return 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toContain('PRIORA');
  });

  it('2. POST /api/auth/login with valid employee credentials should authenticate via bcrypt and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rahul.sharma@northstar.io',
        password: 'Employee123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('rahul.sharma@northstar.io');
    expect(res.body.data.user.role).toBe('employee');
    expect(res.body.data.user.password_hash).toBeUndefined(); // NEVER EXPOSE HASH!

    employeeToken = res.body.data.token;
  });

  it('3. POST /api/auth/login with valid manager credentials should return manager JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sarah.chen@northstar.io',
        password: 'Manager123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('manager');

    managerToken = res.body.data.token;
  });

  it('4. POST /api/auth/login with invalid password should fail', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rahul.sharma@northstar.io',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('5. GET /api/employee/dashboard should return Next Best Action and Yesterday summary', async () => {
    const res = await request(app)
      .get('/api/employee/dashboard')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.employee.name).toBe('Rahul Sharma');
    expect(res.body.data.nextBestAction).toBeDefined();
    // Task #6 must be #1 Next Best Action
    expect(res.body.data.nextBestAction.title).toContain('Payment API');
    expect(res.body.data.nextBestAction.rank).toBe(1);
    expect(res.body.data.yesterday.completed).toBe(7);
    expect(res.body.data.yesterday.carriedForward).toBe(2);
  }, 20000);

  it('6. Employee should be forbidden from accessing Management dashboard', async () => {
    const res = await request(app)
      .get('/api/management/dashboard')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('7. Manager accessing Management dashboard should see 5 teams, Operations Needs Attention, and Early Warning', async () => {
    const res = await request(app)
      .get('/api/management/dashboard')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.teamHealth.length).toBe(5);

    const ops = res.body.data.teamHealth.find((t: any) => t.name === 'Operations');
    expect(ops).toBeDefined();
    expect(ops.healthStatus).toBe('NEEDS_ATTENTION');
    expect(ops.actualProgress).toBeGreaterThanOrEqual(0);

    expect(res.body.data.earlyWarning.teamName).toBe('Operations');
    expect(res.body.data.earlyWarning.delta).toBeGreaterThan(10);
  }, 20000);

  it('8. POST /api/ai/insights should respond using live DB data with deterministic fallback', async () => {
    const res = await request(app)
      .post('/api/ai/insights')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ query: 'Which teams need attention today?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.answer).toBeDefined();
    expect(res.body.data.answer.toLowerCase()).toContain('operations');
  });
});
