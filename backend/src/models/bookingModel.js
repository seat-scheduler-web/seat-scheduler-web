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

async function getBookingUser(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
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

export { createBooking, getBookingBySeat, getBookingSchedule, getBookingUser };
