import { Router } from "express";
import { addBooking } from "../controllers/bookingController.js";

const router = Router();

router.post("/", addBooking);

export { router as bookingRoutes };
