import jwt from "jsonwebtoken";
import { getUserById } from "../models/userModel.js";

async function authMiddleware(req, res, next) {
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

    const user = await getUserById(payload.id);
    if (!user) return res.status(401).json({ message: "Invalid auth token" });

    req.user = user;
    req.userId = user.id;
    next();
  } catch (_error) {
    res.status(401).json({ message: "Invalid auth token" });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Auth token is required" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access is required" });
  }

  next();
}

export { adminMiddleware, authMiddleware };
