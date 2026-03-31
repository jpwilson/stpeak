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

  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static getAll() {
    return [...users];
  }

  static getByEmail(email) {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static create(data) {
    if (!data.name || !data.email) {
      throw new Error('Name and email are required');
    }

    if (!User.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
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

  static getUserTaskCount(userId) {
    const Task = require('./Task');
    const allTasks = Task.getAll();
    return allTasks.filter(t => t.assignee === userId).length;
  }

  static _reset() {
    users = [];
  }
}

module.exports = User;
