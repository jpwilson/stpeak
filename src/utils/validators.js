function validateTask(data) {
  const errors = [];

  if (!data.title || (typeof data.title === 'string' && data.title.trim() === '')) {
    errors.push('Title is required');
  }

  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    errors.push('Invalid priority level');
  }

  if (data.status && !['pending', 'in-progress', 'completed'].includes(data.status)) {
    errors.push('Invalid status');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/<[^>]*>/g, '');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateDaysOverdue(createdAt, dueDays = 7) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = now - created;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays - dueDays;
}

module.exports = {
  validateTask,
  sanitizeInput,
  formatDate,
  calculateDaysOverdue
};
