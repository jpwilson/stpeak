const { validateTask, formatDate } = require('../src/utils/validators');

describe('Validators', () => {
  test('should validate task with title', () => {
    const result = validateTask({ title: 'Test' });
    expect(result.isValid).toBe(true);
  });

  test('should reject task without title', () => {
    const result = validateTask({});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });

  // NOTE: No tests for:
  // - sanitizeInput()
  // - calculateDaysOverdue()
  // - formatDate() edge cases
  // - Priority validation mismatch with Task model
  // - Empty string title
  // - XSS in input
});
