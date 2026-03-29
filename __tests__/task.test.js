const Task = require('../src/models/Task');

beforeEach(() => {
  Task._reset();
});

describe('Task Model', () => {
  test('should create a task', () => {
    const task = Task.create({
      title: 'Test Task',
      description: 'A test task',
      assignee: 'John',
      priority: 'high'
    });

    expect(task).toHaveProperty('id');
    expect(task.title).toBe('Test Task');
    expect(task.status).toBe('pending');
  });

  test('should get all tasks', () => {
    Task.create({ title: 'Task 1', description: 'Desc 1' });
    Task.create({ title: 'Task 2', description: 'Desc 2' });

    const tasks = Task.getAll();
    expect(tasks).toHaveLength(2);
  });

  test('should get task by id', () => {
    const created = Task.create({ title: 'Find Me', description: 'Test' });
    const found = Task.getById(created.id);
    expect(found.title).toBe('Find Me');
  });

  // NOTE: No tests for:
  // - Task.update()
  // - Task.delete()
  // - Task.complete()
  // - Task.getStats()
  // - Task.getAll() with filter
  // - Priority validation
  // - Edge cases (empty title, null values, etc.)
});
