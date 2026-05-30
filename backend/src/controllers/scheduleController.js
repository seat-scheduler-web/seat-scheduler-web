import { getMovieById } from "../models/movieModel.js";
import {
  createSchedule,
  getScheduleById,
  getSchedules,
} from "../models/scheduleModel.js";

function isPositiveNumber(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime());
}

async function listSchedules(req, res, next) {
  try {
    const { movieId } = req.query;

    if (movieId && !isPositiveNumber(movieId)) {
      return res.status(400).json({ message: "Movie must be a valid id" });
    }

    const schedules = await getSchedules(movieId);
    res.json(schedules);
  } catch (error) {
    next(error);
  }
}

async function getSchedule(req, res, next) {
  try {
    if (!isPositiveNumber(req.params.id)) {
      return res.status(400).json({ message: "Schedule must be a valid id" });
    }

    const schedule = await getScheduleById(req.params.id);

    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    res.json(schedule);
  } catch (error) {
    next(error);
  }
}

async function addSchedule(req, res, next) {
  try {
    const { movieId, showTime, studio } = req.body;

    if (!movieId || !showTime || !studio) {
      return res
        .status(400)
        .json({ message: "Movie, show time, and studio are required" });
    }

    if (!isPositiveNumber(movieId)) {
      return res.status(400).json({ message: "Movie must be a valid id" });
    }

    if (!isValidDate(showTime)) {
      return res.status(400).json({ message: "Show time must be a valid date" });
    }

    if (typeof studio !== "string" || studio.trim() === "") {
      return res.status(400).json({ message: "Studio must be a valid string" });
    }

    const movie = await getMovieById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const schedule = await createSchedule({
      movieId,
      showTime,
      studio: studio.trim(),
    });

    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
}

export { addSchedule, getSchedule, listSchedules };
