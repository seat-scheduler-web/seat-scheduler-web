import { getBookingsBySchedule } from "../models/bookingModel.js";
import { sendError } from "../lib/apiResponse.js";
import {
  hasRequiredFields,
  isNonEmptyString,
  isPositiveId,
  isValidDate,
} from "../lib/validation.js";
import { getMovieById } from "../models/movieModel.js";
import {
  createSchedule,
  getScheduleById,
  getSchedules,
} from "../models/scheduleModel.js";
import { get, set, invalidatePrefix } from "../lib/cache.js";

const CACHE_TTL = 60; // seconds

const seatRows = ["A", "B", "C", "D", "E"];
const seatsPerRow = 8;

function getSeatNumbers() {
  return seatRows.flatMap((row) =>
    Array.from({ length: seatsPerRow }, (_seat, index) => `${row}${index + 1}`),
  );
}

async function listSchedules(req, res, next) {
  try {
    const { movieId } = req.query;

    if (movieId && !isPositiveId(movieId)) {
      return sendError(res, 400, "Movie must be a valid id");
    }

    // Build cache key based on query params
    const cacheKey = movieId
      ? `schedules:list:movie:${movieId}`
      : "schedules:list";

    const cached = get(cacheKey);
    if (cached) {
      res.set("X-Cache", "HIT");
      res.json(cached);
      return;
    }

    const schedules = await getSchedules(movieId);
    set(cacheKey, schedules, CACHE_TTL);
    res.set("X-Cache", "MISS");
    res.json(schedules);
  } catch (error) {
    next(error);
  }
}

async function getSchedule(req, res, next) {
  try {
    if (!isPositiveId(req.params.id)) {
      return sendError(res, 400, "Schedule must be a valid id");
    }

    const cacheKey = `schedules:${req.params.id}`;
    const cached = get(cacheKey);
    if (cached) {
      res.set("X-Cache", "HIT");
      res.json(cached);
      return;
    }

    const schedule = await getScheduleById(req.params.id);

    if (!schedule) return sendError(res, 404, "Schedule not found");

    set(cacheKey, schedule, CACHE_TTL);
    res.set("X-Cache", "MISS");
    res.json(schedule);
  } catch (error) {
    next(error);
  }
}

async function getSeatAvailability(req, res, next) {
  try {
    if (!isPositiveId(req.params.id)) {
      return sendError(res, 400, "Schedule must be a valid id");
    }

    // Seat availability is real-time data, use shorter cache
    const cacheKey = `schedules:${req.params.id}:seats`;
    const cached = get(cacheKey);
    if (cached) {
      res.set("X-Cache", "HIT");
      res.json(cached);
      return;
    }

    const schedule = await getScheduleById(req.params.id);
    if (!schedule) return sendError(res, 404, "Schedule not found");

    const bookings = await getBookingsBySchedule(req.params.id);
    const bookedSeats = bookings.map((booking) => booking.seatNumber);
    const bookedSeatSet = new Set(bookedSeats);
    const seats = getSeatNumbers();

    const result = {
      schedule,
      seats,
      availableSeats: seats.filter((seat) => !bookedSeatSet.has(seat)),
      bookedSeats,
    };

    // Cache seat availability for shorter time (15 seconds)
    set(cacheKey, result, 15);
    res.set("X-Cache", "MISS");
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function addSchedule(req, res, next) {
  try {
    const { movieId, showTime, studio } = req.body;

    if (!hasRequiredFields(req.body, ["movieId", "showTime", "studio"])) {
      return sendError(res, 400, "Movie, show time, and studio are required");
    }

    if (!isPositiveId(movieId)) {
      return sendError(res, 400, "Movie must be a valid id");
    }

    if (!isValidDate(showTime)) {
      return sendError(res, 400, "Show time must be a valid date");
    }

    if (!isNonEmptyString(studio)) {
      return sendError(res, 400, "Studio must be a valid string");
    }

    const movie = await getMovieById(movieId);
    if (!movie) return sendError(res, 404, "Movie not found");

    const schedule = await createSchedule({
      movieId,
      showTime,
      studio: studio.trim(),
    });

    // Invalidate schedule list caches and movie sections
    invalidatePrefix("schedules:");
    invalidatePrefix("movies:sections");

    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
}

export { addSchedule, getSchedule, getSeatAvailability, listSchedules };
