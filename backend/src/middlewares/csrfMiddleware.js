import crypto from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

function generateToken() {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

function csrfProtection(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const token = generateToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      path: "/",
      partitioned: true,
    });
    res.locals.csrfToken = token;
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      error: "CSRF validation failed",
      message: "Invalid or missing CSRF token",
    });
  }

  next();
}

function getCsrfToken(req, res) {
  let token = req.cookies?.[CSRF_COOKIE_NAME];
  if (!token) {
    token = generateToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      path: "/",
      partitioned: true,
    });
  }
  return token;
}

export { csrfProtection, getCsrfToken, CSRF_HEADER_NAME };
