import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.js";

const password = await bcrypt.hash("password123", 10);

async function seedUser({ username, email, role }) {
  return prisma.user.upsert({
    where: { email },
    update: {
      username,
      role,
    },
    create: {
      username,
      email,
      password,
      role,
    },
  });
}

async function seedMovie({ title, description, duration, genre, posterUrl }) {
  const movie = await prisma.movie.findFirst({
    where: { title },
  });

  if (movie) return movie;

  return prisma.movie.create({
    data: {
      title,
      description,
      duration,
      genre,
      posterUrl,
    },
  });
}

async function seedSchedule({ movieId, showTime, studio }) {
  const showDate = new Date(showTime);
  const schedule = await prisma.schedule.findFirst({
    where: {
      movieId,
      showTime: showDate,
      studio,
    },
  });

  if (schedule) return schedule;

  return prisma.schedule.create({
    data: {
      movieId,
      showTime: showDate,
      studio,
    },
  });
}

async function seedBooking({ userId, scheduleId, seatNumber }) {
  const booking = await prisma.booking.findFirst({
    where: {
      scheduleId,
      seatNumber,
    },
  });

  if (booking) return booking;

  return prisma.booking.create({
    data: {
      userId,
      scheduleId,
      seatNumber,
    },
  });
}

async function main() {
  const admin = await seedUser({
    username: "admin",
    email: "admin@example.com",
    role: "ADMIN",
  });

  const user = await seedUser({
    username: "demo",
    email: "demo@example.com",
    role: "USER",
  });

  const interstellar = await seedMovie({
    title: "Interstellar",
    description: "A space exploration story about time, family, and survival.",
    duration: 169,
    genre: "Sci-Fi",
    posterUrl: null,
  });

  const spiritedAway = await seedMovie({
    title: "Spirited Away",
    description: "A young girl enters a mysterious world of spirits.",
    duration: 125,
    genre: "Animation",
    posterUrl: null,
  });

  const darkKnight = await seedMovie({
    title: "The Dark Knight",
    description:
      "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into anarchy.",
    duration: 152,
    genre: "Action",
    posterUrl: null,
  });

  const grandBudapest = await seedMovie({
    title: "The Grand Budapest Hotel",
    description:
      "A legendary concierge at a famous European hotel between the wars and his friendship with a young employee.",
    duration: 99,
    genre: "Comedy",
    posterUrl: null,
  });

  const interstellarEvening = await seedSchedule({
    movieId: interstellar.id,
    showTime: "2026-06-05T19:00:00.000Z",
    studio: "Studio 1",
  });

  await seedSchedule({
    movieId: interstellar.id,
    showTime: "2026-06-06T14:00:00.000Z",
    studio: "Studio 2",
  });

  await seedSchedule({
    movieId: spiritedAway.id,
    showTime: "2026-06-05T16:30:00.000Z",
    studio: "Studio 3",
  });

  await seedSchedule({
    movieId: darkKnight.id,
    showTime: "2026-06-07T20:00:00.000Z",
    studio: "Studio 1",
  });

  await seedSchedule({
    movieId: grandBudapest.id,
    showTime: "2026-06-08T15:00:00.000Z",
    studio: "Studio 4",
  });

  await seedBooking({
    userId: user.id,
    scheduleId: interstellarEvening.id,
    seatNumber: "A1",
  });

  console.log("Seed data created");
  console.log("Admin login: admin@example.com / password123");
  console.log("User login: demo@example.com / password123");
  console.log(`Admin user id: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
