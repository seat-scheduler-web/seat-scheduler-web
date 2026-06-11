import {
  cancelBooking,
  createBooking,
  getBookingById,
  getBookingBySeat,
  getBookingSchedule,
  getBookingsByUser,
} from "../models/bookingModel.js";
import { sendError } from "../lib/apiResponse.js";
import {
  hasRequiredFields,
  isNonEmptyString,
  isPositiveId,
} from "../lib/validation.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

async function getBooking(req, res, next) {
  try {
    if (!isPositiveId(req.params.id)) {
      return sendError(res, 400, "Booking must be a valid id");
    }

    const booking = await getBookingById(req.params.id);
    if (!booking) return sendError(res, 404, "Booking not found");

    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function addBooking(req, res, next) {
  try {
    const { scheduleId, seatNumber } = req.body;

    if (!hasRequiredFields(req.body, ["scheduleId", "seatNumber"])) {
      return sendError(res, 400, "Schedule and seat number are required");
    }

    if (!isPositiveId(scheduleId)) {
      return sendError(res, 400, "Schedule must be a valid id");
    }

    if (!isNonEmptyString(seatNumber)) {
      return sendError(res, 400, "Seat number must be a valid string");
    }

    const schedule = await getBookingSchedule(scheduleId);
    if (!schedule) return sendError(res, 404, "Schedule not found");

    const bookedSeat = await getBookingBySeat(scheduleId, seatNumber.trim());
    if (bookedSeat) return sendError(res, 409, "Seat is already booked");

    const booking = await createBooking({
      userId: req.userId,
      scheduleId,
      seatNumber: seatNumber.trim(),
    });

    res.status(201).json({
      message: "Booking confirmed",
      booking,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return sendError(res, 409, "Seat is already booked");
    }

    next(error);
  }
}

async function listUserBookings(req, res, next) {
  try {
    // Parse pagination params
    const page = Math.max(1, parseInt(req.query.page) || DEFAULT_PAGE);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT),
    );

    const result = await getBookingsByUser(req.userId, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function removeBooking(req, res, next) {
  try {
    if (!isPositiveId(req.params.id)) {
      return sendError(res, 400, "Booking must be a valid id");
    }

    const booking = await getBookingById(req.params.id);
    if (!booking) return sendError(res, 404, "Booking not found");

    if (booking.userId !== req.userId) {
      return sendError(res, 403, "You can only cancel your own booking");
    }

    if (booking.status === "CANCELLED") {
      return sendError(res, 400, "Booking is already cancelled");
    }

    const cancelledBooking = await cancelBooking(req.params.id);

    res.json({
      message: "Booking cancelled",
      booking: cancelledBooking,
    });
  } catch (error) {
    next(error);
  }
}

export { addBooking, getBooking, listUserBookings, removeBooking };
