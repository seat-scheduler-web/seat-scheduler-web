import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Auth token is required" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Auth token is required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.userId = payload.id;
    next();
  } catch (_error) {
    res.status(401).json({ message: "Invalid auth token" });
  }
}

export { authMiddleware };
