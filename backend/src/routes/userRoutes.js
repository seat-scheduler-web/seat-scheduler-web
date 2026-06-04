import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  loginUser,
  registerUser,
  updateProfile,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/me", authMiddleware, updateProfile);
router.patch("/me/password", authMiddleware, changePassword);

export { router as userRoutes };
