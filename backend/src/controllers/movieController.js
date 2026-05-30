import {
  createMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  updateMovie,
} from "../models/movieModel.js";
import { sendError } from "../lib/apiResponse.js";
import { hasRequiredFields, isPositiveId } from "../lib/validation.js";

async function listMovies(_req, res, next) {
  try {
    const movies = await getMovies();
    res.json(movies);
  } catch (error) {
    next(error);
  }
}

async function getMovie(req, res, next) {
  try {
    if (!isPositiveId(req.params.id)) {
      return sendError(res, 400, "Movie must be a valid id");
    }

    const movie = await getMovieById(req.params.id);

    if (!movie) return sendError(res, 404, "Movie not found");

    res.json(movie);
  } catch (error) {
    next(error);
  }
}

async function addMovie(req, res, next) {
  try {
    if (!hasRequiredFields(req.body, ["title", "duration"])) {
      return sendError(res, 400, "Title and duration are required");
    }

    const movie = await createMovie(req.body);
    res.status(201).json(movie);
  } catch (error) {
    next(error);
  }
}

async function editMovie(req, res, next) {
  try {
    if (!isPositiveId(req.params.id)) {
      return sendError(res, 400, "Movie must be a valid id");
    }

    const movie = await updateMovie(req.params.id, req.body);

    if (!movie) return sendError(res, 404, "Movie not found");

    res.json(movie);
  } catch (error) {
    next(error);
  }
}

async function removeMovie(req, res, next) {
  try {
    if (!isPositiveId(req.params.id)) {
      return sendError(res, 400, "Movie must be a valid id");
    }

    const movie = await deleteMovie(req.params.id);

    if (!movie) return sendError(res, 404, "Movie not found");

    res.json(movie);
  } catch (error) {
    next(error);
  }
}

export { addMovie, editMovie, getMovie, listMovies, removeMovie };
