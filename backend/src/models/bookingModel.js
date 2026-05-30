import { prisma } from "../lib/prisma.js";

const includeConfirmation = {
  user: {
    select: {
      id: true,
      username: true,
      email: true,
    },
  },
  schedule: {
    include: {
      movie: true,
    },
  },
};

async function createBooking({ userId, scheduleId, seatNumber }) {
  return prisma.booking.create({
    data: {
      userId: Number(userId),
      scheduleId: Number(scheduleId),
      seatNumber,
    },
    include: includeConfirmation,
  });
}

async function getBookingSchedule(id) {
  return prisma.schedule.findUnique({
    where: { id: Number(id) },
  });
}

async function getBookingBySeat(scheduleId, seatNumber) {
  return prisma.booking.findFirst({
    where: {
      scheduleId: Number(scheduleId),
      seatNumber,
    },
  });
}

async function getBookingsBySchedule(scheduleId) {
  return prisma.booking.findMany({
    where: { scheduleId: Number(scheduleId) },
  });
}

async function getBookingsByUser(userId) {
  return prisma.booking.findMany({
    where: { userId: Number(userId) },
    include: includeConfirmation,
    orderBy: { createdAt: "desc" },
  });
}

async function getBookingById(id) {
  return prisma.booking.findUnique({
    where: { id: Number(id) },
    include: includeConfirmation,
  });
}

async function cancelBooking(id) {
  return prisma.booking.update({
    where: { id: Number(id) },
    data: { status: "CANCELLED" },
    include: includeConfirmation,
  });
}

export {
  cancelBooking,
  createBooking,
  getBookingById,
  getBookingBySeat,
  getBookingSchedule,
  getBookingsBySchedule,
  getBookingsByUser,
};
