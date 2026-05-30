import {
  createBooking,
  getBookingBySeat,
  getBookingSchedule,
} from "../models/bookingModel.js";

function isPositiveNumber(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

async function addBooking(req, res, next) {
  try {
    const { scheduleId, seatNumber } = req.body;

    if (!scheduleId || !seatNumber) {
      return res
        .status(400)
        .json({ message: "Schedule and seat number are required" });
    }

    if (!isPositiveNumber(scheduleId)) {
      return res.status(400).json({ message: "Schedule must be a valid id" });
    }

    if (typeof seatNumber !== "string" || seatNumber.trim() === "") {
      return res
        .status(400)
        .json({ message: "Seat number must be a valid string" });
    }

    const schedule = await getBookingSchedule(scheduleId);
    if (!schedule)
      return res.status(404).json({ message: "Schedule not found" });

    const bookedSeat = await getBookingBySeat(scheduleId, seatNumber.trim());
    if (bookedSeat)
      return res.status(409).json({ message: "Seat is already booked" });

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
      return res.status(409).json({ message: "Seat is already booked" });
    }

    next(error);
  }
}

export { addBooking };
