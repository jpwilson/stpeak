const { validateTask, sanitizeInput, formatDate, calculateDaysOverdue } = require('../src/utils/validators');

describe('validateTask', () => {
  test('should accept task with valid title', () => {
    const result = validateTask({ title: 'Test' });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject task without title', () => {
    const result = validateTask({});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });

  test('should reject task with empty string title', () => {
    const result = validateTask({ title: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });

  test('should reject task with whitespace-only title', () => {
    const result = validateTask({ title: '   ' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });

  test('should accept valid priorities (low, medium, high)', () => {
    expect(validateTask({ title: 'T', priority: 'low' }).isValid).toBe(true);
    expect(validateTask({ title: 'T', priority: 'medium' }).isValid).toBe(true);
    expect(validateTask({ title: 'T', priority: 'high' }).isValid).toBe(true);
  });

  test('should reject invalid priority', () => {
    const result = validateTask({ title: 'T', priority: 'urgent' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid priority level');
  });

  test('should accept valid statuses', () => {
    expect(validateTask({ title: 'T', status: 'pending' }).isValid).toBe(true);
    expect(validateTask({ title: 'T', status: 'in-progress' }).isValid).toBe(true);
    expect(validateTask({ title: 'T', status: 'completed' }).isValid).toBe(true);
  });

  test('should reject invalid status', () => {
    const result = validateTask({ title: 'T', status: 'archived' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid status');
  });

  test('should collect multiple errors', () => {
    const result = validateTask({ priority: 'invalid', status: 'invalid' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(3);
  });
});

describe('sanitizeInput', () => {
  test('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  test('should strip HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>hello')).toBe('alert("xss")hello');
  });

  test('should strip nested tags', () => {
    expect(sanitizeInput('<b>bold</b>')).toBe('bold');
  });

  test('should return non-string values unchanged', () => {
    expect(sanitizeInput(42)).toBe(42);
    expect(sanitizeInput(null)).toBeNull();
    expect(sanitizeInput(undefined)).toBeUndefined();
  });
});

describe('formatDate', () => {
  test('should format a valid date with zero-padded month and day', () => {
    // Use noon UTC to avoid timezone boundary issues
    expect(formatDate('2024-01-05T12:00:00.000Z')).toBe('2024-01-05');
  });

  test('should handle dates with double-digit months and days', () => {
    expect(formatDate('2024-12-25T12:00:00.000Z')).toBe('2024-12-25');
  });

  test('should return Invalid Date for bad input', () => {
    expect(formatDate('not-a-date')).toBe('Invalid Date');
  });
});

describe('calculateDaysOverdue', () => {
  test('should return negative when task is not yet overdue', () => {
    const now = new Date().toISOString();
    const result = calculateDaysOverdue(now, 7);
    expect(result).toBeLessThanOrEqual(0);
  });

  test('should return positive when task is overdue', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const result = calculateDaysOverdue(tenDaysAgo, 7);
    expect(result).toBeGreaterThan(0);
  });

  test('should use default dueDays of 7', () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const result = calculateDaysOverdue(eightDaysAgo);
    expect(result).toBeGreaterThan(0);
  });
});
