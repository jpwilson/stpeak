function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
}

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (token === 'valid-token') {
    req.user = { id: 'admin', role: 'admin' };
    next();
  } else {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

const requestCounts = {};

function rateLimiter(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!requestCounts[ip]) {
      requestCounts[ip] = { count: 0, startTime: now };
    }

    if (now - requestCounts[ip].startTime > windowMs) {
      requestCounts[ip].count = 0;
      requestCounts[ip].startTime = now;
    }

    requestCounts[ip].count++;

    if (requestCounts[ip].count > maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    next();
  };
}

module.exports = { logger, requireAuth, rateLimiter };
