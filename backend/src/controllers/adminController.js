import { prisma } from "../lib/prisma.js";
import { sendError } from "../lib/apiResponse.js";
import { isPositiveId } from "../lib/validation.js";
import { invalidatePrefix } from "../lib/cache.js";

async function listAllBookings(req, res, next) {
  try {
    const { status, scheduleId } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (scheduleId) {
      where.scheduleId = Number(scheduleId);
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        schedule: {
          include: {
            movie: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

async function deleteSchedule(req, res, next) {
  try {
    if (!isPositiveId(req.params.id)) {
      return sendError(res, 400, "Schedule must be a valid id");
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!schedule) {
      return sendError(res, 404, "Schedule not found");
    }

    await prisma.schedule.delete({
      where: { id: Number(req.params.id) },
    });

    // Invalidate schedule and movie section caches
    invalidatePrefix("schedules:");
    invalidatePrefix("movies:sections");

    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export { deleteSchedule, listAllBookings };
