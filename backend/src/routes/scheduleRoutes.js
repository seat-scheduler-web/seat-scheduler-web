import { Router } from "express";
import {
  addSchedule,
  getSchedule,
  getSeatAvailability,
  listSchedules,
} from "../controllers/scheduleController.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", listSchedules);
router.get("/:id/seats", getSeatAvailability);
router.get("/:id", getSchedule);
router.post("/", authMiddleware, adminMiddleware, addSchedule);

export { router as scheduleRoutes };
