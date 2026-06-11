function escapeHtml(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function sanitizeValue(value) {
  if (typeof value === "string") {
    return escapeHtml(value.trim());
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    return sanitizeObject(value);
  }
  return value;
}

function sanitizeObject(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeValue(value);
  }
  return sanitized;
}

function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.sanitizedQuery = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === "object") {
    req.sanitizedParams = sanitizeObject(req.params);
  }
  next();
}

function setSecurityHeaders(req, res, next) {
  res.set({
    "Content-Security-Policy": "default-src 'self'",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
  });
  next();
}

export { sanitizeInput, setSecurityHeaders, escapeHtml, sanitizeObject };
