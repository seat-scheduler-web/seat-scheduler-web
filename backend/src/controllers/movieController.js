import {
  createMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  getMoviesWithBookingCounts,
  updateMovie,
} from "../models/movieModel.js";
import { sendError } from "../lib/apiResponse.js";
import { hasRequiredFields, isPositiveId } from "../lib/validation.js";
import { searchMovie, getPosterUrl } from "../lib/tmdb.js";

async function listMovies(req, res, next) {
  try {
    const { view } = req.query;

    if (view === "sections") {
      const movies = await getMoviesWithBookingCounts();
      const now = new Date();

      // Now Popular: movies with most bookings
      const popular = [...movies]
        .filter((m) => m.bookingCount > 0)
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 6);

      // Newest: movies by creation date
      const newest = [...movies]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

      // Coming Soon: movies with future schedules
      const comingSoon = [...movies]
        .filter((m) => m.futureSchedules > 0)
        .sort((a, b) => {
          const aNextShow = Math.min(
            ...a.schedules
              .filter((s) => new Date(s.showTime) > now)
              .map((s) => new Date(s.showTime).getTime()),
          );
          const bNextShow = Math.min(
            ...b.schedules
              .filter((s) => new Date(s.showTime) > now)
              .map((s) => new Date(s.showTime).getTime()),
          );
          return aNextShow - bNextShow;
        })
        .slice(0, 6);

      // Trending: movies with most bookings in the last 7 days
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const trending = [...movies]
        .map((m) => ({
          ...m,
          recentBookings: m.schedules.reduce(
            (count, schedule) =>
              count +
              schedule.bookings.filter(
                (b) => new Date(b.createdAt) >= oneWeekAgo,
              ).length,
            0,
          ),
        }))
        .filter((m) => m.recentBookings > 0)
        .sort((a, b) => b.recentBookings - a.recentBookings)
        .slice(0, 6);

      res.json({
        popular,
        newest,
        comingSoon,
        trending,
      });
      return;
    }

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

async function searchTmdb(req, res, next) {
  try {
    const { query } = req.query;

    if (!query) {
      return sendError(res, 400, "Query parameter is required");
    }

    const movie = await searchMovie(query);

    if (!movie) {
      return sendError(res, 404, "Movie not found in TMDB");
    }

    res.json({
      tmdbId: movie.id,
      title: movie.title,
      description: movie.overview,
      rating: movie.vote_average,
      posterUrl: getPosterUrl(movie.poster_path),
      releaseDate: movie.release_date,
    });
  } catch (error) {
    next(error);
  }
}

export { addMovie, editMovie, getMovie, listMovies, removeMovie, searchTmdb };
