import {
  createBooking,
  getBookingBySeat,
  getBookingSchedule,
  getBookingUser,
} from "../models/bookingModel.js";

function isPositiveNumber(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

async function addBooking(req, res, next) {
  try {
    const { userId, scheduleId, seatNumber } = req.body;

    if (!userId || !scheduleId || !seatNumber) {
      return res
        .status(400)
        .json({ message: "User, schedule, and seat number are required" });
    }

    if (!isPositiveNumber(userId) || !isPositiveNumber(scheduleId)) {
      return res
        .status(400)
        .json({ message: "User and schedule must be valid ids" });
    }

    if (typeof seatNumber !== "string" || seatNumber.trim() === "") {
      return res
        .status(400)
        .json({ message: "Seat number must be a valid string" });
    }

    const user = await getBookingUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const schedule = await getBookingSchedule(scheduleId);
    if (!schedule)
      return res.status(404).json({ message: "Schedule not found" });

    const bookedSeat = await getBookingBySeat(scheduleId, seatNumber.trim());
    if (bookedSeat)
      return res.status(409).json({ message: "Seat is already booked" });

    const booking = await createBooking({
      userId,
      scheduleId,
      seatNumber: seatNumber.trim(),
    });

    res.status(201).json({
      message: "Booking confirmed",
      booking,
    });
  } catch (error) {
    next(error);
  }
}

export { addBooking };
