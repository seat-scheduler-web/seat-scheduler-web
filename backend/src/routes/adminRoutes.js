import { Router } from "express";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/authMiddleware.js";
import {
  deleteSchedule,
  listAllBookings,
} from "../controllers/adminController.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Bookings management
router.get("/bookings", listAllBookings);

// Schedule management
router.delete("/schedules/:id", deleteSchedule);

export { router as adminRoutes };
