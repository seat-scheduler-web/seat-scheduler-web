import jwt from "jsonwebtoken";
import { sendError } from "../lib/apiResponse.js";
import { getUserById } from "../models/userModel.js";

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return sendError(res, 401, "Auth token is required");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return sendError(res, 401, "Auth token is required");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const user = await getUserById(payload.id);
    if (!user) return sendError(res, 401, "Invalid auth token");

    req.user = user;
    req.userId = user.id;
    next();
  } catch (_error) {
    sendError(res, 401, "Invalid auth token");
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user) {
    return sendError(res, 401, "Auth token is required");
  }

  if (req.user.role !== "ADMIN") {
    return sendError(res, 403, "Admin access is required");
  }

  next();
}

export { adminMiddleware, authMiddleware };
