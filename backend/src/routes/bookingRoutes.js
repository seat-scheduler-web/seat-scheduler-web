import { Router } from "express";
import { addBooking } from "../controllers/bookingController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, addBooking);

export { router as bookingRoutes };
