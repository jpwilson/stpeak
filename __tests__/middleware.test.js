const { logger, requireAuth, rateLimiter } = require('../src/middleware/logger');

describe('logger middleware', () => {
  test('should call next()', () => {
    const req = { method: 'GET', url: '/test' };
    const res = {};
    const next = jest.fn();

    logger(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('requireAuth middleware', () => {
  let res;
  let next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  test('should return 401 when no authorization header', () => {
    const req = { headers: {} };
    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('should accept valid token without Bearer prefix', () => {
    const req = { headers: { authorization: 'valid-token' } };
    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 'admin', role: 'admin' });
  });

  test('should accept valid token with Bearer prefix', () => {
    const req = { headers: { authorization: 'Bearer valid-token' } };
    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 'admin', role: 'admin' });
  });

  test('should return 403 for invalid token', () => {
    const req = { headers: { authorization: 'Bearer wrong-token' } };
    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('rateLimiter middleware', () => {
  let res;
  let next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  test('should allow requests under the limit', () => {
    const limiter = rateLimiter(5, 60000);
    const req = { ip: '192.168.1.100' };

    limiter(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('should block requests over the limit', () => {
    const limiter = rateLimiter(3, 60000);
    const req = { ip: '192.168.1.101' };

    for (let i = 0; i < 3; i++) {
      next.mockClear();
      limiter(req, res, next);
      expect(next).toHaveBeenCalled();
    }

    next.mockClear();
    limiter(req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(next).not.toHaveBeenCalled();
  });

  test('should reset count after window expires', () => {
    const limiter = rateLimiter(2, 100);
    const req = { ip: '192.168.1.102' };

    // Use up the limit
    limiter(req, res, next);
    limiter(req, res, next);

    // Simulate window expiry by manipulating the internal state
    // We'll use a real delay here
    return new Promise(resolve => {
      setTimeout(() => {
        next.mockClear();
        limiter(req, res, next);
        expect(next).toHaveBeenCalled();
        resolve();
      }, 150);
    });
  });
});
