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
  rating,
  schedules = [],
}) {
  return prisma.movie.create({
    data: {
      title,
      description,
      duration: Number(duration),
      genre,
      posterUrl,
      rating: rating ? Number(rating) : null,
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

async function getMovies({
  page = 1,
  limit = 12,
  search = "",
  duration = "all",
  price = "all",
  studio = "all",
  time = "all",
  sort = "default",
} = {}) {
  const skip = (page - 1) * limit;

  // Build where clause for filters
  const where = {};

  // Search filter (title, description, genre)
  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { genre: { contains: search, mode: "insensitive" } },
    ];
  }

  // Studio filter
  if (studio && studio !== "all") {
    where.schedules = {
      some: { studio },
    };
  }

  // Build order by clause
  let orderBy = { createdAt: "desc" };
  switch (sort) {
    case "title-asc":
      orderBy = { title: "asc" };
      break;
    case "title-desc":
      orderBy = { title: "desc" };
      break;
    case "duration-asc":
      orderBy = { duration: "asc" };
      break;
    case "duration-desc":
      orderBy = { duration: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "rating":
      orderBy = { rating: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  // Fetch movies with pagination
  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      skip,
      take: limit,
      include: includeSchedulesWithBookings,
      orderBy,
    }),
    prisma.movie.count({ where }),
  ]);

  // Post-processing filters that can't be done in DB query
  let filteredMovies = movies;

  // Duration filter (post-query since it's computed)
  if (duration && duration !== "all") {
    filteredMovies = filteredMovies.filter((movie) => {
      switch (duration) {
        case "short":
          return movie.duration < 90;
        case "medium":
          return movie.duration >= 90 && movie.duration <= 150;
        case "long":
          return movie.duration > 150;
        default:
          return true;
      }
    });
  }

  // Price filter (post-query since it depends on related schedules)
  if (price && price !== "all") {
    filteredMovies = filteredMovies.filter((movie) => {
      const prices = movie.schedules?.map((s) => s.price) || [];
      if (prices.length === 0) return false;
      const minPrice = Math.min(...prices);
      switch (price) {
        case "low":
          return minPrice < 40000;
        case "medium":
          return minPrice >= 40000 && minPrice <= 60000;
        case "high":
          return minPrice > 60000;
        default:
          return true;
      }
    });
  }

  // Time of day filter (post-query since it depends on related schedules)
  if (time && time !== "all") {
    filteredMovies = filteredMovies.filter((movie) => {
      return movie.schedules?.some((schedule) => {
        const hour = new Date(schedule.showTime).getHours();
        switch (time) {
          case "morning":
            return hour >= 6 && hour < 12;
          case "afternoon":
            return hour >= 12 && hour < 18;
          case "evening":
            return hour >= 18 || hour < 6;
          default:
            return true;
        }
      });
    });
  }

  // Sort by popularity or price (post-query since they depend on related data)
  if (sort === "popularity") {
    filteredMovies.sort((a, b) => {
      const aCount =
        a.schedules?.reduce((acc, s) => acc + (s.bookings?.length || 0), 0) ||
        0;
      const bCount =
        b.schedules?.reduce((acc, s) => acc + (s.bookings?.length || 0), 0) ||
        0;
      return bCount - aCount;
    });
  } else if (sort === "price-asc") {
    filteredMovies.sort((a, b) => {
      const aPrice = Math.min(
        ...(a.schedules?.map((s) => s.price) || [Infinity]),
      );
      const bPrice = Math.min(
        ...(b.schedules?.map((s) => s.price) || [Infinity]),
      );
      return aPrice - bPrice;
    });
  } else if (sort === "price-desc") {
    filteredMovies.sort((a, b) => {
      const aPrice = Math.min(
        ...(a.schedules?.map((s) => s.price) || [Infinity]),
      );
      const bPrice = Math.min(
        ...(b.schedules?.map((s) => s.price) || [Infinity]),
      );
      return bPrice - aPrice;
    });
  }

  return {
    movies: filteredMovies,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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
  { title, description, duration, genre, posterUrl, rating },
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
      rating: rating === undefined ? undefined : rating ? Number(rating) : null,
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
