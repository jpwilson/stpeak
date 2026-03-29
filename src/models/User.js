const { v4: uuidv4 } = require('uuid');

let users = [];

class User {
  constructor(name, email, role) {
    this.id = uuidv4();
    this.name = name;
    this.email = email;
    this.role = role || 'member';
    this.createdAt = new Date().toISOString();
  }

  // BUG 11: email validation regex is wrong (doesn't require TLD)
  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+$/.test(email);  // missing TLD check
  }

  static getAll() {
    return [...users];
  }

  static getByEmail(email) {
    // BUG 12: case-sensitive email lookup
    return users.find(u => u.email === email);
  }

  static create(data) {
    if (!data.name || !data.email) {
      throw new Error('Name and email are required');
    }

    if (!User.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    // BUG 13: duplicate check uses wrong field
    const existing = users.find(u => u.name === data.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const user = new User(data.name, data.email, data.role);
    users.push(user);
    return user;
  }

  static delete(id) {
    const initialLength = users.length;
    users = users.filter(u => u.id !== id);
    return users.length !== initialLength;
  }

  // BUG 14: getUserTaskCount references Task but doesn't import it properly
  static getUserTaskCount(userId) {
    const Task = require('./Task');
    const allTasks = Task.getAll();
    // BUG 15: compares assignee (name) with userId (uuid)
    return allTasks.filter(t => t.assignee === userId).length;
  }

  static _reset() {
    users = [];
  }
}

module.exports = User;
