import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sendError } from "./lib/apiResponse.js";
import { prisma } from "./lib/prisma.js";
import { bookingRoutes } from "./routes/bookingRoutes.js";
import { movieRoutes } from "./routes/movieRoutes.js";
import { scheduleRoutes } from "./routes/scheduleRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
