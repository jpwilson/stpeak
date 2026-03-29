const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { validateTask, sanitizeInput } = require('../utils/validators');

// GET all tasks
router.get('/', (req, res) => {
  const { status } = req.query;
  try {
    const tasks = Task.getAll(status);
    res.json({ success: true, data: tasks, count: tasks.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single task
router.get('/:id', (req, res) => {
  const task = Task.getById(req.params.id);
  if (!task) {
    // BUG 27: returns 200 instead of 404
    return res.status(200).json({ success: false, error: 'Task not found' });
  }
  res.json({ success: true, data: task });
});

// POST create task
router.post('/', (req, res) => {
  const validation = validateTask(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ success: false, errors: validation.errors });
  }

  try {
    // BUG 28: doesn't sanitize input before creating
    const task = Task.create(req.body);
    // BUG 29: returns 200 instead of 201 for creation
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update task
router.put('/:id', (req, res) => {
  const validation = validateTask(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ success: false, errors: validation.errors });
  }

  const task = Task.update(req.params.id, req.body);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }
  res.json({ success: true, data: task });
});

// DELETE task
router.delete('/:id', (req, res) => {
  // BUG 30: doesn't check if task exists before deleting
  const deleted = Task.delete(req.params.id);
  // Always returns success even if task didn't exist
  res.json({ success: true, message: 'Task deleted' });
});

// POST complete task
router.post('/:id/complete', (req, res) => {
  const task = Task.complete(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }
  res.json({ success: true, data: task });
});

// BUG 31: search route has a regex injection vulnerability
router.get('/search/:query', (req, res) => {
  const query = req.params.query;
  const regex = new RegExp(query, 'i');  // user input directly in regex
  const tasks = Task.getAll();
  const results = tasks.filter(t => regex.test(t.title) || regex.test(t.description));
  res.json({ success: true, data: results });
});

module.exports = router;
