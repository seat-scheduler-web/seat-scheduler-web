import { Router } from "express";
import {
  addBooking,
  getBooking,
  listUserBookings,
  removeBooking,
} from "../controllers/bookingController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, listUserBookings);
router.get("/:id", authMiddleware, getBooking);
router.post("/", authMiddleware, addBooking);
router.patch("/:id/cancel", authMiddleware, removeBooking);

export { router as bookingRoutes };
