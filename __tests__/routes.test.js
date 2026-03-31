const request = require('supertest');
const app = require('../src/server');
const Task = require('../src/models/Task');
const User = require('../src/models/User');

beforeEach(() => {
  Task._reset();
  User._reset();
});

describe('Task Routes', () => {
  describe('GET /api/tasks', () => {
    test('should return empty array when no tasks', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    test('should return all tasks', async () => {
      Task.create({ title: 'Task 1' });
      Task.create({ title: 'Task 2' });

      const res = await request(app).get('/api/tasks');
      expect(res.body.data).toHaveLength(2);
      expect(res.body.count).toBe(2);
    });

    test('should filter by status query param', async () => {
      Task.create({ title: 'Task 1' });
      const t2 = Task.create({ title: 'Task 2' });
      Task.complete(t2.id);

      const res = await request(app).get('/api/tasks?status=completed');
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('completed');
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('should return 404 for nonexistent task', async () => {
      const res = await request(app).get('/api/tasks/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should return task by id', async () => {
      const task = Task.create({ title: 'Find Me' });
      const res = await request(app).get(`/api/tasks/${task.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Find Me');
    });
  });

  describe('POST /api/tasks', () => {
    test('should create a task and return 201', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'New Task', description: 'Test', priority: 'high' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Task');
      expect(res.body.data.priority).toBe('high');
    });

    test('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should sanitize HTML from input', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '<script>alert("xss")</script>Real Title' });

      expect(res.status).toBe(201);
      expect(res.body.data.title).not.toContain('<script>');
    });

    test('should reject invalid priority', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', priority: 'urgent' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('should update an existing task', async () => {
      const task = Task.create({ title: 'Original' });
      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated');
    });

    test('should return 404 for nonexistent task', async () => {
      const res = await request(app)
        .put('/api/tasks/nonexistent')
        .send({ title: 'Update' });

      expect(res.status).toBe(404);
    });

    test('should return 400 for invalid data', async () => {
      const task = Task.create({ title: 'Task' });
      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: 'Task', priority: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should delete an existing task', async () => {
      const task = Task.create({ title: 'Delete Me' });
      const res = await request(app).delete(`/api/tasks/${task.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Task.getAll()).toHaveLength(0);
    });

    test('should return 404 for nonexistent task', async () => {
      const res = await request(app).delete('/api/tasks/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/tasks/:id/complete', () => {
    test('should mark task as completed', async () => {
      const task = Task.create({ title: 'Complete Me' });
      const res = await request(app).post(`/api/tasks/${task.id}/complete`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.completedAt).toBeDefined();
    });

    test('should return 404 for nonexistent task', async () => {
      const res = await request(app).post('/api/tasks/nonexistent/complete');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/tasks/search/:query', () => {
    test('should find tasks matching title', async () => {
      Task.create({ title: 'Buy groceries', description: 'Food' });
      Task.create({ title: 'Read book', description: 'Fiction' });

      const res = await request(app).get('/api/tasks/search/groceries');
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Buy groceries');
    });

    test('should find tasks matching description', async () => {
      Task.create({ title: 'Task', description: 'Important meeting' });

      const res = await request(app).get('/api/tasks/search/meeting');
      expect(res.body.data).toHaveLength(1);
    });

    test('should return empty array when no matches', async () => {
      Task.create({ title: 'Task' });
      const res = await request(app).get('/api/tasks/search/nonexistent');
      expect(res.body.data).toHaveLength(0);
    });

    test('should handle regex special characters safely', async () => {
      Task.create({ title: 'Test (parens)' });
      const res = await request(app).get('/api/tasks/search/(parens)');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });
});

describe('User Routes', () => {
  describe('GET /api/users', () => {
    test('should return empty array when no users', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    test('should return all users', async () => {
      User.create({ name: 'Alice', email: 'alice@example.com' });
      const res = await request(app).get('/api/users');
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/users', () => {
    test('should create a user', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Alice', email: 'alice@example.com' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Alice');
    });

    test('should return 400 for missing name', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ email: 'alice@example.com' });

      expect(res.status).toBe(400);
    });

    test('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Alice', email: 'not-an-email' });

      expect(res.status).toBe(400);
    });

    test('should return 400 for duplicate email', async () => {
      User.create({ name: 'Alice', email: 'alice@example.com' });
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Alice2', email: 'alice@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('already exists');
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should delete an existing user', async () => {
      const user = User.create({ name: 'Alice', email: 'alice@example.com' });
      const res = await request(app).delete(`/api/users/${user.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should return 404 for nonexistent user', async () => {
      const res = await request(app).delete('/api/users/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/users/:id/tasks', () => {
    test('should return task count for user', async () => {
      const user = User.create({ name: 'Alice', email: 'alice@example.com' });
      Task.create({ title: 'Task 1', assignee: user.id });
      Task.create({ title: 'Task 2', assignee: user.id });

      const res = await request(app).get(`/api/users/${user.id}/tasks`);
      expect(res.body.taskCount).toBe(2);
    });

    test('should return 0 when user has no tasks', async () => {
      const res = await request(app).get('/api/users/some-id/tasks');
      expect(res.body.taskCount).toBe(0);
    });
  });
});

describe('Stats Routes', () => {
  describe('GET /api/stats', () => {
    test('should return stats with zero tasks', async () => {
      const res = await request(app).get('/api/stats');
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.completionRate).toBe(0);
    });

    test('should return correct stats', async () => {
      Task.create({ title: 'Task 1' });
      const t2 = Task.create({ title: 'Task 2' });
      Task.complete(t2.id);

      const res = await request(app).get('/api/stats');
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.completed).toBe(1);
      expect(res.body.data.pending).toBe(1);
      expect(res.body.data.completionRate).toBe(50);
    });
  });

  describe('GET /api/stats/overdue', () => {
    test('should return empty when no tasks are overdue', async () => {
      Task.create({ title: 'Fresh Task' });
      const res = await request(app).get('/api/stats/overdue');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    test('should not include completed tasks in overdue', async () => {
      const task = Task.create({ title: 'Old Task' });
      Task.complete(task.id);

      const res = await request(app).get('/api/stats/overdue');
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/stats/summary', () => {
    test('should return summary with task stats and user count', async () => {
      Task.create({ title: 'Task 1' });
      User.create({ name: 'Alice', email: 'alice@example.com' });

      const res = await request(app).get('/api/stats/summary');
      expect(res.status).toBe(200);
      expect(res.body.data.taskStats).toBeDefined();
      expect(res.body.data.recentTasks).toHaveLength(1);
      expect(res.body.data.totalUsers).toBe(1);
    });

    test('should return recent tasks (last 5)', async () => {
      for (let i = 0; i < 8; i++) {
        Task.create({ title: `Task ${i}` });
      }

      const res = await request(app).get('/api/stats/summary');
      expect(res.body.data.recentTasks).toHaveLength(5);
    });
  });
});

describe('Static files and root', () => {
  test('GET / should return HTML', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });
});
