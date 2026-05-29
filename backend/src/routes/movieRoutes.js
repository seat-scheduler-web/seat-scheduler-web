import { Router } from "express";
import {
  addMovie,
  editMovie,
  getMovie,
  listMovies,
  removeMovie,
} from "../controllers/movieController.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", listMovies);
router.get("/:id", getMovie);
router.post("/", authMiddleware, adminMiddleware, addMovie);
router.patch("/:id", authMiddleware, adminMiddleware, editMovie);
router.delete("/:id", authMiddleware, adminMiddleware, removeMovie);

export { router as movieRoutes };
