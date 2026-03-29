const request = require('supertest');
const app = require('../src/server');
const Task = require('../src/models/Task');

beforeEach(() => {
  Task._reset();
});

describe('Task Routes', () => {
  // NOTE: These tests will fail because the server has bugs
  // (express.json missing parens, logger missing next(), etc.)

  test('GET /api/tasks should return empty array', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  test('POST /api/tasks should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'New Task', description: 'Test', priority: 'high' });

    expect(res.status).toBe(201);  // Will fail - route returns 200
    expect(res.body.success).toBe(true);
  });

  test('GET /api/tasks/:id should return 404 for missing task', async () => {
    const res = await request(app).get('/api/tasks/nonexistent');
    expect(res.status).toBe(404);  // Will fail - route returns 200
  });

  // NOTE: No tests for:
  // - PUT /api/tasks/:id
  // - DELETE /api/tasks/:id
  // - POST /api/tasks/:id/complete
  // - GET /api/tasks/search/:query
  // - User routes
  // - Stats routes
  // - Error handling
  // - Middleware behavior
});
