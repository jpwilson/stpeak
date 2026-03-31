const Task = require('../src/models/Task');

beforeEach(() => {
  Task._reset();
});

describe('Task Model', () => {
  describe('create', () => {
    test('should create a task with all fields', () => {
      const task = Task.create({
        title: 'Test Task',
        description: 'A test task',
        assignee: 'John',
        priority: 'high'
      });

      expect(task).toHaveProperty('id');
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('A test task');
      expect(task.assignee).toBe('John');
      expect(task.priority).toBe('high');
      expect(task.status).toBe('pending');
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
      expect(task.completedAt).toBeNull();
    });

    test('should default priority to medium for invalid values', () => {
      const task = Task.create({ title: 'Task', priority: 'urgent' });
      expect(task.priority).toBe('medium');
    });

    test('should accept low priority', () => {
      const task = Task.create({ title: 'Task', priority: 'low' });
      expect(task.priority).toBe('low');
    });

    test('should accept medium priority', () => {
      const task = Task.create({ title: 'Task', priority: 'medium' });
      expect(task.priority).toBe('medium');
    });

    test('should default priority to medium when not provided', () => {
      const task = Task.create({ title: 'Task' });
      expect(task.priority).toBe('medium');
    });
  });

  describe('getAll', () => {
    test('should return empty array when no tasks', () => {
      expect(Task.getAll()).toEqual([]);
    });

    test('should return all tasks', () => {
      Task.create({ title: 'Task 1', description: 'Desc 1' });
      Task.create({ title: 'Task 2', description: 'Desc 2' });
      expect(Task.getAll()).toHaveLength(2);
    });

    test('should return a copy (not the original array)', () => {
      Task.create({ title: 'Task 1' });
      const tasks = Task.getAll();
      tasks.push({ title: 'Fake' });
      expect(Task.getAll()).toHaveLength(1);
    });

    test('should filter by status', () => {
      Task.create({ title: 'Task 1' });
      const t2 = Task.create({ title: 'Task 2' });
      Task.complete(t2.id);

      expect(Task.getAll('pending')).toHaveLength(1);
      expect(Task.getAll('completed')).toHaveLength(1);
      expect(Task.getAll('in-progress')).toHaveLength(0);
    });
  });

  describe('getById', () => {
    test('should find task by id', () => {
      const created = Task.create({ title: 'Find Me', description: 'Test' });
      const found = Task.getById(created.id);
      expect(found.title).toBe('Find Me');
    });

    test('should return undefined for nonexistent id', () => {
      expect(Task.getById('nonexistent')).toBeUndefined();
    });
  });

  describe('update', () => {
    test('should update task fields', () => {
      const task = Task.create({ title: 'Original', description: 'Old desc' });
      const updated = Task.update(task.id, { title: 'Updated', description: 'New desc' });

      expect(updated.title).toBe('Updated');
      expect(updated.description).toBe('New desc');
    });

    test('should persist update in storage', () => {
      const task = Task.create({ title: 'Original' });
      Task.update(task.id, { title: 'Updated' });
      const fetched = Task.getById(task.id);
      expect(fetched.title).toBe('Updated');
    });

    test('should not allow updating id or createdAt', () => {
      const task = Task.create({ title: 'Task' });
      const originalId = task.id;
      const originalCreatedAt = task.createdAt;

      Task.update(task.id, { id: 'new-id', createdAt: '2020-01-01' });
      const fetched = Task.getById(originalId);

      expect(fetched.id).toBe(originalId);
      expect(fetched.createdAt).toBe(originalCreatedAt);
    });

    test('should update updatedAt timestamp', () => {
      const task = Task.create({ title: 'Task' });
      const originalUpdatedAt = task.updatedAt;

      // small delay to ensure different timestamp
      const updated = Task.update(task.id, { title: 'Changed' });
      expect(updated.updatedAt).toBeDefined();
    });

    test('should return null for nonexistent task', () => {
      expect(Task.update('nonexistent', { title: 'X' })).toBeNull();
    });
  });

  describe('delete', () => {
    test('should delete a task and return true', () => {
      const task = Task.create({ title: 'Delete Me' });
      expect(Task.delete(task.id)).toBe(true);
      expect(Task.getAll()).toHaveLength(0);
    });

    test('should return false for nonexistent task', () => {
      expect(Task.delete('nonexistent')).toBe(false);
    });

    test('should only delete the target task', () => {
      const t1 = Task.create({ title: 'Task 1' });
      const t2 = Task.create({ title: 'Task 2' });
      Task.delete(t1.id);

      const remaining = Task.getAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(t2.id);
    });
  });

  describe('complete', () => {
    test('should mark task as completed', () => {
      const task = Task.create({ title: 'Complete Me' });
      const completed = Task.complete(task.id);

      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeDefined();
    });

    test('should return null for nonexistent task', () => {
      expect(Task.complete('nonexistent')).toBeNull();
    });

    test('completed task should show in completed filter', () => {
      const task = Task.create({ title: 'Task' });
      Task.complete(task.id);
      expect(Task.getAll('completed')).toHaveLength(1);
    });
  });

  describe('getStats', () => {
    test('should return zeros when no tasks exist', () => {
      const stats = Task.getStats();
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.inProgress).toBe(0);
      expect(stats.completionRate).toBe(0);
    });

    test('should correctly count task statuses', () => {
      Task.create({ title: 'Task 1' });
      Task.create({ title: 'Task 2' });
      const t3 = Task.create({ title: 'Task 3' });
      Task.complete(t3.id);

      const stats = Task.getStats();
      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.completionRate).toBeCloseTo(33.33, 1);
    });

    test('should calculate 100% when all tasks are completed', () => {
      const t1 = Task.create({ title: 'Task 1' });
      Task.complete(t1.id);

      const stats = Task.getStats();
      expect(stats.completionRate).toBe(100);
    });
  });
});
