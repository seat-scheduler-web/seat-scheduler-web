import {
  createMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  updateMovie,
} from "../models/movieModel.js";

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
    const movie = await getMovieById(req.params.id);

    if (!movie) return res.status(404).json({ message: "Movie not found" });

    res.json(movie);
  } catch (error) {
    next(error);
  }
}

async function addMovie(req, res, next) {
  try {
    if (!req.body.title || !req.body.duration) {
      return res.status(400).json({ message: "Title and duration are required" });
    }

    const movie = await createMovie(req.body);
    res.status(201).json(movie);
  } catch (error) {
    next(error);
  }
}

async function editMovie(req, res, next) {
  try {
    const movie = await updateMovie(req.params.id, req.body);

    if (!movie) return res.status(404).json({ message: "Movie not found" });

    res.json(movie);
  } catch (error) {
    next(error);
  }
}

async function removeMovie(req, res, next) {
  try {
    const movie = await deleteMovie(req.params.id);

    if (!movie) return res.status(404).json({ message: "Movie not found" });

    res.json(movie);
  } catch (error) {
    next(error);
  }
}

export { addMovie, editMovie, getMovie, listMovies, removeMovie };
