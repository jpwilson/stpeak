// BUG 16: validateTask doesn't check for empty strings
function validateTask(data) {
  const errors = [];

  if (!data.title) {
    errors.push('Title is required');
  }

  // BUG 17: priority check allows invalid values through
  if (data.priority && !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
    // 'urgent' is not a valid priority in the Task model, only low/medium/high
    errors.push('Invalid priority level');
  }

  // BUG 18: status validation has a valid status that doesn't match the model
  if (data.status && !['pending', 'in-progress', 'completed', 'archived'].includes(data.status)) {
    errors.push('Invalid status');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// BUG 19: sanitizeInput doesn't actually sanitize - just returns input
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  // Should strip HTML/script tags but doesn't
  return str.trim();
}

// BUG 20: formatDate crashes on invalid input
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  // Doesn't zero-pad months/days: "2024-1-5" instead of "2024-01-05"
}

// BUG 21: calculateDaysOverdue has an off-by-one and wrong date math
function calculateDaysOverdue(createdAt, dueDays = 7) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = now - created;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60));  // divides by hours, not days
  return diffDays - dueDays;
}

module.exports = {
  validateTask,
  sanitizeInput,
  formatDate,
  calculateDaysOverdue
};
