const { v4: uuidv4 } = require('uuid');

// In-memory task storage
let tasks = [];

class Task {
  constructor(title, description, assignee, priority) {
    this.id = uuidv4();
    this.title = title;
    this.description = description;
    this.assignee = assignee;
    // BUG 4: priority validation is backwards
    this.priority = ['low', 'medium', 'high'].includes(priority) ? 'medium' : priority;
    this.status = 'pending';
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.completedAt = null;
  }

  // BUG 5: static method references wrong variable name
  static getAll(filterStatus) {
    if (filterStatus) {
      return task.filter(t => t.status === filterStatus);  // 'task' should be 'tasks'
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

  // BUG 6: update doesn't actually save the changes back
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

    // BUG: Never writes task back to the array
    // tasks[taskIndex] = task;  <-- this line is missing

    return task;
  }

  // BUG 7: delete uses wrong comparison operator
  static delete(id) {
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id == id);  // == instead of !==, deletes everything EXCEPT the target
    return tasks.length !== initialLength;
  }

  // BUG 8: complete method sets wrong status value
  static complete(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return null;

    task.status = 'compleete';  // typo in status
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    return task;
  }

  static getStats() {
    const total = tasks.length;
    // BUG 9: counts pending tasks as completed due to wrong status string
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;

    return {
      total,
      completed,
      pending,
      inProgress,
      // BUG 10: division by zero not handled, and logic is wrong
      completionRate: (completed / total) * 100
    };
  }

  // Reset for testing
  static _reset() {
    tasks = [];
  }
}

module.exports = Task;
