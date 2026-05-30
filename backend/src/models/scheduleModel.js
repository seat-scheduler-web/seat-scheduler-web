import { prisma } from "../lib/prisma.js";

const includeMovie = { movie: true };

async function createSchedule({ movieId, showTime, studio }) {
  return prisma.schedule.create({
    data: {
      movieId: Number(movieId),
      showTime: new Date(showTime),
      studio,
    },
    include: includeMovie,
  });
}

async function getSchedules(movieId) {
  return prisma.schedule.findMany({
    where: movieId ? { movieId: Number(movieId) } : undefined,
    include: includeMovie,
    orderBy: { showTime: "asc" },
  });
}

async function getScheduleById(id) {
  return prisma.schedule.findUnique({
    where: { id: Number(id) },
    include: includeMovie,
  });
}

export { createSchedule, getScheduleById, getSchedules };
