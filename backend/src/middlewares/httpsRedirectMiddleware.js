const HSTS_MAX_AGE = 31536000;

function httpsRedirect(req, res, next) {
  if (process.env.NODE_ENV !== "production") {
    return next();
  }

  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    return next();
  }

  const httpsUrl = `https://${req.headers.host}${req.url}`;
  res.redirect(301, httpsUrl);
}

function setHttpsSecurityHeaders(req, res, next) {
  res.set({
    "Strict-Transport-Security": `max-age=${HSTS_MAX_AGE}; includeSubDomains; preload`,
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
  });

  next();
}

export { httpsRedirect, setHttpsSecurityHeaders };
