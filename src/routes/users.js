const express = require('express')
const router = express.Router()
const User = require('../models/User')

// GET all users
router.get('/', (req, res) => {
  const users = User.getAll();
  res.json({ success: true, data: users });
});

// POST create user
router.post('/', (req, res) => {
  try {
    const user = User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE user
router.delete('/:id', (req, res) => {
  const deleted = User.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({ success: true, message: 'User deleted' });
});

// GET user task count
router.get('/:id/tasks', (req, res) => {
  const count = User.getUserTaskCount(req.params.id);
  res.json({ success: true, taskCount: count });
});

module.exports = router;
