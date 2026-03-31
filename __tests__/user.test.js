const User = require('../src/models/User');
const Task = require('../src/models/Task');

beforeEach(() => {
  User._reset();
  Task._reset();
});

describe('User Model', () => {
  describe('isValidEmail', () => {
    test('should accept valid emails', () => {
      expect(User.isValidEmail('user@example.com')).toBe(true);
      expect(User.isValidEmail('user@sub.domain.com')).toBe(true);
    });

    test('should reject emails without TLD', () => {
      expect(User.isValidEmail('user@domain')).toBe(false);
    });

    test('should reject emails without @', () => {
      expect(User.isValidEmail('userdomain.com')).toBe(false);
    });

    test('should reject empty string', () => {
      expect(User.isValidEmail('')).toBe(false);
    });
  });

  describe('create', () => {
    test('should create a user with name and email', () => {
      const user = User.create({ name: 'Alice', email: 'alice@example.com' });
      expect(user.name).toBe('Alice');
      expect(user.email).toBe('alice@example.com');
      expect(user.role).toBe('member');
      expect(user.id).toBeDefined();
    });

    test('should accept custom role', () => {
      const user = User.create({ name: 'Admin', email: 'admin@example.com', role: 'admin' });
      expect(user.role).toBe('admin');
    });

    test('should throw when name is missing', () => {
      expect(() => User.create({ email: 'a@b.com' })).toThrow('Name and email are required');
    });

    test('should throw when email is missing', () => {
      expect(() => User.create({ name: 'Alice' })).toThrow('Name and email are required');
    });

    test('should throw for invalid email format', () => {
      expect(() => User.create({ name: 'Alice', email: 'invalid' })).toThrow('Invalid email format');
    });

    test('should throw for duplicate email', () => {
      User.create({ name: 'Alice', email: 'alice@example.com' });
      expect(() => User.create({ name: 'Bob', email: 'alice@example.com' }))
        .toThrow('User with this email already exists');
    });

    test('should detect duplicate email case-insensitively', () => {
      User.create({ name: 'Alice', email: 'alice@example.com' });
      expect(() => User.create({ name: 'Bob', email: 'Alice@Example.COM' }))
        .toThrow('User with this email already exists');
    });
  });

  describe('getAll', () => {
    test('should return empty array when no users', () => {
      expect(User.getAll()).toEqual([]);
    });

    test('should return all users', () => {
      User.create({ name: 'Alice', email: 'alice@example.com' });
      User.create({ name: 'Bob', email: 'bob@example.com' });
      expect(User.getAll()).toHaveLength(2);
    });
  });

  describe('getByEmail', () => {
    test('should find user by email', () => {
      User.create({ name: 'Alice', email: 'alice@example.com' });
      const found = User.getByEmail('alice@example.com');
      expect(found.name).toBe('Alice');
    });

    test('should find user case-insensitively', () => {
      User.create({ name: 'Alice', email: 'alice@example.com' });
      const found = User.getByEmail('Alice@Example.COM');
      expect(found.name).toBe('Alice');
    });

    test('should return undefined for nonexistent email', () => {
      expect(User.getByEmail('nobody@example.com')).toBeUndefined();
    });
  });

  describe('delete', () => {
    test('should delete a user', () => {
      const user = User.create({ name: 'Alice', email: 'alice@example.com' });
      expect(User.delete(user.id)).toBe(true);
      expect(User.getAll()).toHaveLength(0);
    });

    test('should return false for nonexistent user', () => {
      expect(User.delete('nonexistent')).toBe(false);
    });
  });

  describe('getUserTaskCount', () => {
    test('should count tasks assigned to user', () => {
      const user = User.create({ name: 'Alice', email: 'alice@example.com' });
      Task.create({ title: 'Task 1', assignee: user.id });
      Task.create({ title: 'Task 2', assignee: user.id });
      Task.create({ title: 'Task 3', assignee: 'other' });

      expect(User.getUserTaskCount(user.id)).toBe(2);
    });

    test('should return 0 when user has no tasks', () => {
      expect(User.getUserTaskCount('some-id')).toBe(0);
    });
  });
});
