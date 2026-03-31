const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { validateTask, sanitizeInput } = require('../utils/validators');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /search must be before /:id to avoid matching "search" as an id
router.get('/search/:query', (req, res) => {
  const query = escapeRegex(req.params.query);
  const regex = new RegExp(query, 'i');
  const tasks = Task.getAll();
  const results = tasks.filter(t => regex.test(t.title) || regex.test(t.description));
  res.json({ success: true, data: results });
});

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
    return res.status(404).json({ success: false, error: 'Task not found' });
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
    const sanitizedData = { ...req.body };
    if (sanitizedData.title) sanitizedData.title = sanitizeInput(sanitizedData.title);
    if (sanitizedData.description) sanitizedData.description = sanitizeInput(sanitizedData.description);
    if (sanitizedData.assignee) sanitizedData.assignee = sanitizeInput(sanitizedData.assignee);

    const task = Task.create(sanitizedData);
    res.status(201).json({ success: true, data: task });
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
  const deleted = Task.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }
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

module.exports = router;
