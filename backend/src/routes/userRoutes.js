import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  loginUser,
  registerUser,
  updateProfile,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getCsrfToken } from "../middlewares/csrfMiddleware.js";

const router = Router();

router.get("/csrf-token", (req, res) => {
  const token = getCsrfToken(req, res);
  res.json({ csrfToken: token });
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/me", authMiddleware, updateProfile);
router.patch("/me/password", authMiddleware, changePassword);

export { router as userRoutes };
