import { prisma } from "../lib/prisma.js";

const includeSchedules = { schedules: { orderBy: { showTime: "asc" } } };

const includeSchedulesWithBookings = {
  schedules: {
    orderBy: { showTime: "asc" },
    include: {
      bookings: true,
    },
  },
};

async function createMovie({
  title,
  description,
  duration,
  genre,
  posterUrl,
  schedules = [],
}) {
  return prisma.movie.create({
    data: {
      title,
      description,
      duration: Number(duration),
      genre,
      posterUrl,
      schedules: {
        create: schedules.map((schedule) => ({
          showTime: new Date(schedule.showTime),
          studio: schedule.studio,
          price: schedule.price ? Number(schedule.price) : 35000,
        })),
      },
    },
    include: includeSchedules,
  });
}

async function getMovies() {
  return prisma.movie.findMany({
    include: includeSchedulesWithBookings,
  });
}

async function getMoviesWithBookingCounts() {
  const movies = await prisma.movie.findMany({
    include: {
      schedules: {
        orderBy: { showTime: "asc" },
        include: {
          bookings: true,
        },
      },
    },
  });

  return movies.map((movie) => ({
    ...movie,
    bookingCount: movie.schedules.reduce(
      (count, schedule) => count + schedule.bookings.length,
      0,
    ),
    futureSchedules: movie.schedules.filter(
      (s) => new Date(s.showTime) > new Date(),
    ).length,
  }));
}

async function getMovieById(id) {
  return prisma.movie.findUnique({
    where: { id: Number(id) },
    include: includeSchedules,
  });
}

async function updateMovie(
  id,
  { title, description, duration, genre, posterUrl },
) {
  const movie = await getMovieById(id);

  if (!movie) return null;

  return prisma.movie.update({
    where: { id: Number(id) },
    data: {
      title,
      description,
      duration: duration === undefined ? undefined : Number(duration),
      genre,
      posterUrl,
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

export {
  createMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  getMoviesWithBookingCounts,
  updateMovie,
};
