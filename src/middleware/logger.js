// BUG 22: logger middleware doesn't call next()
function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  // missing next() call - will hang every request
}

// BUG 23: auth middleware checks header wrong
function requireAuth(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // BUG 24: should strip 'Bearer ' prefix before checking
  if (token === 'valid-token') {
    req.user = { id: 'admin', role: 'admin' };
    next();
  } else {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// BUG 25: rate limiter stores state but never cleans up (memory leak)
// and the window calculation is wrong
const requestCounts = {};

function rateLimiter(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!requestCounts[ip]) {
      requestCounts[ip] = { count: 1, startTime: now };
    }

    // BUG 26: resets count but not the timer when window expires
    if (now - requestCounts[ip].startTime > windowMs) {
      requestCounts[ip].count = 0;
      // missing: requestCounts[ip].startTime = now;
    }

    requestCounts[ip].count++;

    if (requestCounts[ip].count > maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    next();
  };
}

module.exports = { logger, requireAuth, rateLimiter };
