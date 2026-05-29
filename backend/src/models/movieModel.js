import { prisma } from "../lib/prisma.js";

const includeSchedules = { schedules: true };

async function createMovie({ title, description, duration, schedules = [] }) {
  return prisma.movie.create({
    data: {
      title,
      description,
      duration: Number(duration),
      schedules: {
        create: schedules.map((schedule) => ({
          showTime: new Date(schedule.showTime),
          studio: schedule.studio,
        })),
      },
    },
    include: includeSchedules,
  });
}

async function getMovies() {
  return prisma.movie.findMany({
    include: includeSchedules,
  });
}

async function getMovieById(id) {
  return prisma.movie.findUnique({
    where: { id: Number(id) },
    include: includeSchedules,
  });
}

async function updateMovie(id, { title, description, duration }) {
  const movie = await getMovieById(id);

  if (!movie) return null;

  return prisma.movie.update({
    where: { id: Number(id) },
    data: {
      title,
      description,
      duration: duration === undefined ? undefined : Number(duration),
    },
    include: includeSchedules,
  });
}

async function deleteMovie(id) {
  const movie = await getMovieById(id);

  if (!movie) return null;

  await prisma.schedule.deleteMany({
    where: { movieId: Number(id) },
  });

  return prisma.movie.delete({
    where: { id: Number(id) },
    include: includeSchedules,
  });
}

export { createMovie, deleteMovie, getMovieById, getMovies, updateMovie };
