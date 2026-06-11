const requestStore = new Map();

const RATE_LIMITS = {
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },
  api: {
    windowMs: 60 * 1000,
    maxRequests: 60,
  },
};

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of requestStore.entries()) {
    if (now - data.startTime > data.windowMs) {
      requestStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || "unknown";
}

function isAuthEndpoint(req) {
  return (
    req.path.startsWith("/api/users") &&
    (req.method === "POST" || req.method === "PATCH")
  );
}

function rateLimit(type = "api") {
  const config = RATE_LIMITS[type];

  return (req, res, next) => {
    const clientIp = getClientIp(req);
    const key = `${type}:${clientIp}`;
    const now = Date.now();

    let record = requestStore.get(key);

    if (!record || now - record.startTime > config.windowMs) {
      record = {
        startTime: now,
        count: 1,
        windowMs: config.windowMs,
      };
      requestStore.set(key, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, config.maxRequests - record.count);
    const resetTime = record.startTime + config.windowMs;
    const retryAfter = Math.ceil((resetTime - now) / 1000);

    res.set({
      "X-RateLimit-Limit": config.maxRequests,
      "X-RateLimit-Remaining": remaining,
      "X-RateLimit-Reset": new Date(resetTime).toISOString(),
    });

    if (record.count > config.maxRequests) {
      res.set("Retry-After", retryAfter);
      return res.status(429).json({
        error: "Too many requests",
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      });
    }

    next();
  };
}

function applyRateLimiting(app) {
  app.use("/api/users", rateLimit("auth"));
  app.use("/api", rateLimit("api"));
}

export { rateLimit, applyRateLimiting, RATE_LIMITS };
