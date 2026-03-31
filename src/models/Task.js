const { v4: uuidv4 } = require('uuid');

// In-memory task storage
let tasks = [];

class Task {
  constructor(title, description, assignee, priority) {
    this.id = uuidv4();
    this.title = title;
    this.description = description;
    this.assignee = assignee;
    this.priority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
    this.status = 'pending';
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.completedAt = null;
  }

  static getAll(filterStatus) {
    if (filterStatus) {
      return tasks.filter(t => t.status === filterStatus);
    }
    return [...tasks];
  }

  static getById(id) {
    return tasks.find(t => t.id === id);
  }

  static create(data) {
    const task = new Task(data.title, data.description, data.assignee, data.priority);
    tasks.push(task);
    return task;
  }

  static update(id, updates) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return null;

    const task = { ...tasks[taskIndex] };
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        task[key] = updates[key];
      }
    });
    task.updatedAt = new Date().toISOString();
    tasks[taskIndex] = task;

    return task;
  }

  static delete(id) {
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== id);
    return tasks.length !== initialLength;
  }

  static complete(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return null;

    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    return task;
  }

  static getStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;

    return {
      total,
      completed,
      pending,
      inProgress,
      completionRate: total === 0 ? 0 : (completed / total) * 100
    };
  }

  // Reset for testing
  static _reset() {
    tasks = [];
  }
}

module.exports = Task;
