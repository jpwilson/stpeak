const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { formatDate, calculateDaysOverdue } = require('../utils/validators');

// GET task statistics
router.get('/', (req, res) => {
  try {
    const stats = Task.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET overdue tasks
router.get('/overdue', (req, res) => {
  const tasks = Task.getAll();
  // BUG 33: overdue logic is wrong because calculateDaysOverdue returns hours not days
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    return calculateDaysOverdue(t.createdAt) > 0;
  });

  res.json({
    success: true,
    data: overdueTasks.map(t => ({
      ...t,
      daysOverdue: calculateDaysOverdue(t.createdAt),
      formattedDate: formatDate(t.createdAt)
    }))
  });
});

// BUG 34: async handler without proper error handling
router.get('/summary', async (req, res) => {
  const tasks = Task.getAll();
  const stats = Task.getStats();

  // BUG 35: undefined variable 'users'
  const summary = {
    taskStats: stats,
    recentTasks: tasks.slice(-5),
    totalUsers: users.length
  };

  res.json({ success: true, data: summary });
});

module.exports = router;
