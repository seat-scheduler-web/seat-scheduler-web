import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getBooking,
  addBooking,
  listUserBookings,
  removeBooking,
} from "../controllers/bookingController.js";

// Mock the bookingModel module
vi.mock("../models/bookingModel.js", () => ({
  getBookingById: vi.fn(),
  createBooking: vi.fn(),
  getBookingBySeat: vi.fn(),
  getBookingSchedule: vi.fn(),
  getBookingsByUser: vi.fn(),
  cancelBooking: vi.fn(),
}));

// Mock the apiResponse module
vi.mock("../lib/apiResponse.js", () => ({
  sendError: vi.fn((res, status, message) => {
    res.statusCode = status;
    res.json({ error: message });
  }),
}));

// Mock the validation module
vi.mock("../lib/validation.js", () => ({
  hasRequiredFields: vi.fn((body, fields) => {
    return fields.every(
      (field) => body[field] !== undefined && body[field] !== "",
    );
  }),
  isPositiveId: vi.fn((value) => {
    return Number.isInteger(Number(value)) && Number(value) > 0;
  }),
  isNonEmptyString: vi.fn((value) => {
    return typeof value === "string" && value.trim() !== "";
  }),
}));

import {
  getBookingById,
  createBooking,
  getBookingBySeat,
  getBookingSchedule,
  getBookingsByUser,
  cancelBooking,
} from "../models/bookingModel.js";
import { sendError } from "../lib/apiResponse.js";

describe("getBooking", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {} };
    res = { json: vi.fn() };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("returns 400 for invalid booking id", async () => {
    req.params.id = "invalid";

    await getBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      400,
      "Booking must be a valid id",
    );
  });

  it("returns 404 when booking not found", async () => {
    req.params.id = "1";
    getBookingById.mockResolvedValue(null);

    await getBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, 404, "Booking not found");
  });

  it("returns booking when found", async () => {
    const mockBooking = { id: 1, userId: 1, scheduleId: 1, seatNumber: "A1" };
    req.params.id = "1";
    getBookingById.mockResolvedValue(mockBooking);

    await getBooking(req, res, next);

    expect(res.json).toHaveBeenCalledWith(mockBooking);
  });

  it("calls next with error on database failure", async () => {
    req.params.id = "1";
    const error = new Error("Database error");
    getBookingById.mockRejectedValue(error);

    await getBooking(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("addBooking", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      userId: 1,
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    req.body = { scheduleId: "" };

    await addBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      400,
      "Schedule and seat number are required",
    );
  });

  it("returns 400 when scheduleId is invalid", async () => {
    req.body = { scheduleId: "invalid", seatNumber: "A1" };

    await addBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      400,
      "Schedule must be a valid id",
    );
  });

  it("returns 400 when seatNumber is empty (fails hasRequiredFields)", async () => {
    // Empty string for seatNumber causes hasRequiredFields to fail first
    req.body = { scheduleId: "1", seatNumber: "" };

    await addBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      400,
      "Schedule and seat number are required",
    );
  });

  it("returns 400 when seatNumber is whitespace only", async () => {
    req.body = { scheduleId: "1", seatNumber: "   " };

    await addBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      400,
      "Seat number must be a valid string",
    );
  });

  it("returns 404 when schedule not found", async () => {
    req.body = { scheduleId: "1", seatNumber: "A1" };
    getBookingSchedule.mockResolvedValue(null);

    await addBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, 404, "Schedule not found");
  });

  it("returns 409 when seat is already booked", async () => {
    req.body = { scheduleId: "1", seatNumber: "A1" };
    getBookingSchedule.mockResolvedValue({ id: 1 });
    getBookingBySeat.mockResolvedValue({ id: 1, seatNumber: "A1" });

    await addBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, 409, "Seat is already booked");
  });

  it("creates booking successfully", async () => {
    const mockBooking = { id: 1, userId: 1, scheduleId: 1, seatNumber: "A1" };
    req.body = { scheduleId: "1", seatNumber: "A1" };
    getBookingSchedule.mockResolvedValue({ id: 1 });
    getBookingBySeat.mockResolvedValue(null);
    createBooking.mockResolvedValue(mockBooking);

    await addBooking(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Booking confirmed",
      booking: mockBooking,
    });
  });

  it("handles P2002 unique constraint error", async () => {
    req.body = { scheduleId: "1", seatNumber: "A1" };
    getBookingSchedule.mockResolvedValue({ id: 1 });
    getBookingBySeat.mockResolvedValue(null);
    const error = new Error("Unique constraint failed");
    error.code = "P2002";
    createBooking.mockRejectedValue(error);

    await addBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, 409, "Seat is already booked");
  });

  it("calls next with non-P2002 errors", async () => {
    req.body = { scheduleId: "1", seatNumber: "A1" };
    getBookingSchedule.mockResolvedValue({ id: 1 });
    getBookingBySeat.mockResolvedValue(null);
    const error = new Error("Database error");
    createBooking.mockRejectedValue(error);

    await addBooking(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("listUserBookings", () => {
  let req, res, next;

  beforeEach(() => {
    req = { userId: 1, query: {} };
    res = { json: vi.fn() };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("returns user bookings", async () => {
    const mockBookings = [
      { id: 1, seatNumber: "A1" },
      { id: 2, seatNumber: "B2" },
    ];
    getBookingsByUser.mockResolvedValue({
      bookings: mockBookings,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    await listUserBookings(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      bookings: mockBookings,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it("calls next with error on database failure", async () => {
    const error = new Error("Database error");
    getBookingsByUser.mockRejectedValue(error);

    await listUserBookings(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("passes pagination params to model", async () => {
    req.query = { page: "2", limit: "5" };
    getBookingsByUser.mockResolvedValue({
      bookings: [],
      total: 0,
      page: 2,
      limit: 5,
      totalPages: 0,
    });

    await listUserBookings(req, res, next);

    expect(getBookingsByUser).toHaveBeenCalledWith(1, 2, 5);
  });
});

describe("removeBooking", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, userId: 1 };
    res = { json: vi.fn() };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("returns 400 for invalid booking id", async () => {
    req.params.id = "invalid";

    await removeBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      400,
      "Booking must be a valid id",
    );
  });

  it("returns 404 when booking not found", async () => {
    req.params.id = "1";
    getBookingById.mockResolvedValue(null);

    await removeBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, 404, "Booking not found");
  });

  it("returns 403 when user does not own the booking", async () => {
    req.params.id = "1";
    req.userId = 1;
    getBookingById.mockResolvedValue({ id: 1, userId: 2, status: "CONFIRMED" });

    await removeBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      403,
      "You can only cancel your own booking",
    );
  });

  it("returns 400 when booking is already cancelled", async () => {
    req.params.id = "1";
    req.userId = 1;
    getBookingById.mockResolvedValue({
      id: 1,
      userId: 1,
      status: "CANCELLED",
    });

    await removeBooking(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      400,
      "Booking is already cancelled",
    );
  });

  it("cancels booking successfully", async () => {
    const mockBooking = { id: 1, userId: 1, status: "CANCELLED" };
    req.params.id = "1";
    req.userId = 1;
    getBookingById.mockResolvedValue({
      id: 1,
      userId: 1,
      status: "CONFIRMED",
    });
    cancelBooking.mockResolvedValue(mockBooking);

    await removeBooking(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      message: "Booking cancelled",
      booking: mockBooking,
    });
  });

  it("calls next with error on database failure", async () => {
    req.params.id = "1";
    getBookingById.mockRejectedValue(new Error("Database error"));

    await removeBooking(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
