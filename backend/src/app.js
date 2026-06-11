import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sendError } from "./lib/apiResponse.js";
import { prisma } from "./lib/prisma.js";
import { validateEnv } from "./lib/validateEnv.js";
import { adminRoutes } from "./routes/adminRoutes.js";
import { bookingRoutes } from "./routes/bookingRoutes.js";
import { movieRoutes } from "./routes/movieRoutes.js";
import { scheduleRoutes } from "./routes/scheduleRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { stats as cacheStats, clear as clearCache } from "./lib/cache.js";
import { applyRateLimiting } from "./middlewares/rateLimitMiddleware.js";
import {
  sanitizeInput,
  setSecurityHeaders,
} from "./middlewares/sanitizeMiddleware.js";

dotenv.config();

validateEnv();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["*"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(sanitizeInput);
app.use(setSecurityHeaders);

// Apply rate limiting to API routes
applyRateLimiting(app);

// Cache headers middleware for GET responses
app.use((req, res, next) => {
  if (req.method === "GET") {
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
  }
  next();
});

app.get("/", (_req, res) => {
  res.send("Server is running");
});

app.get("/health/db", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

// Cache monitoring endpoint
app.get("/health/cache", (_req, res) => {
  res.json({
    status: "ok",
    cache: cacheStats(),
  });
});

// Clear cache endpoint (for admin use)
app.post("/api/admin/cache/clear", (_req, res) => {
  clearCache();
  res.json({ message: "Cache cleared successfully" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);

  if (error.code === "P2002") {
    return sendError(res, 409, "Resource already exists");
  }

  if (error.code === "P2025") {
    return sendError(res, 404, "Resource not found");
  }

  sendError(res, 500, "Internal server error");
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
