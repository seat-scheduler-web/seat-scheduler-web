import { Router } from "express";
import {
  addMovie,
  editMovie,
  getMovie,
  listMovies,
  removeMovie,
} from "../controllers/movieController.js";

const router = Router();

router.get("/", listMovies);
router.get("/:id", getMovie);
router.post("/", addMovie);
router.patch("/:id", editMovie);
router.delete("/:id", removeMovie);

export { router as movieRoutes };
