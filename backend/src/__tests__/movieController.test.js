import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listMovies,
  getMovie,
  addMovie,
  editMovie,
  removeMovie,
} from "../controllers/movieController.js";

vi.mock("../models/movieModel.js", () => ({
  getMovies: vi.fn(),
  getMoviesWithBookingCounts: vi.fn(),
  getMovieById: vi.fn(),
  createMovie: vi.fn(),
  updateMovie: vi.fn(),
  deleteMovie: vi.fn(),
}));

vi.mock("../lib/apiResponse.js", () => ({
  sendError: vi.fn((res, status, message) => {
    res.statusCode = status;
    res.json({ error: message });
  }),
}));

vi.mock("../lib/validation.js", () => ({
  hasRequiredFields: vi.fn((body, fields) => {
    return fields.every(
      (field) => body[field] !== undefined && body[field] !== "",
    );
  }),
  isPositiveId: vi.fn((value) => {
    return Number.isInteger(Number(value)) && Number(value) > 0;
  }),
}));

vi.mock("../lib/cache.js", () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  invalidatePrefix: vi.fn(),
  clear: vi.fn(),
  stats: vi.fn(() => ({ size: 0, keys: [] })),
}));

import {
  getMovies,
  getMoviesWithBookingCounts,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../models/movieModel.js";
import { sendError } from "../lib/apiResponse.js";

describe("listMovies", () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: {} };
    res = { json: vi.fn(), set: vi.fn().mockReturnThis() };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe("sections view", () => {
    it("returns cached sections when available", async () => {
      const { get } = await import("../lib/cache.js");
      const cachedSections = {
        popular: [{ id: 1, title: "Popular Movie" }],
        newest: [],
        comingSoon: [],
        trending: [],
      };
      get.mockReturnValueOnce(cachedSections);

      req.query.view = "sections";
      await listMovies(req, res, next);

      expect(res.json).toHaveBeenCalledWith(cachedSections);
      expect(res.set).toHaveBeenCalledWith("X-Cache", "HIT");
    });

    it("fetches and caches sections when not cached", async () => {
      const now = Date.now();
      const mockMovies = [
        {
          id: 1,
          title: "Popular Movie",
          createdAt: new Date(now - 86400000).toISOString(),
          schedules: [
            {
              showTime: new Date(now + 86400000).toISOString(),
              bookings: [{}, {}],
            },
          ],
          bookingCount: 2,
          futureSchedules: 1,
        },
        {
          id: 2,
          title: "New Movie",
          createdAt: new Date(now).toISOString(),
          schedules: [],
          bookingCount: 0,
          futureSchedules: 0,
        },
      ];
      getMoviesWithBookingCounts.mockResolvedValue(mockMovies);

      req.query.view = "sections";
      await listMovies(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const result = res.json.mock.calls[0][0];
      expect(result.popular).toBeDefined();
      expect(result.newest).toBeDefined();
      expect(result.comingSoon).toBeDefined();
      expect(result.trending).toBeDefined();
    });
  });

  describe("regular movie list", () => {
    it("returns cached movies when available", async () => {
      const { get } = await import("../lib/cache.js");
      const cachedData = {
        movies: [{ id: 1, title: "Cached Movie" }],
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
      };
      get.mockReturnValueOnce(cachedData);

      await listMovies(req, res, next);

      expect(res.json).toHaveBeenCalledWith(cachedData);
      expect(res.set).toHaveBeenCalledWith("X-Cache", "HIT");
    });

    it("fetches movies from model when not cached", async () => {
      const mockData = {
        movies: [
          { id: 1, title: "Movie 1", duration: 120 },
          { id: 2, title: "Movie 2", duration: 90 },
        ],
        total: 2,
        page: 1,
        limit: 12,
        totalPages: 1,
      };
      getMovies.mockResolvedValue(mockData);

      await listMovies(req, res, next);

      expect(getMovies).toHaveBeenCalledWith({
        page: 1,
        limit: 12,
        search: "",
        duration: "all",
        price: "all",
        studio: "all",
        time: "all",
        sort: "default",
      });
      expect(res.json).toHaveBeenCalledWith(mockData);
      expect(res.set).toHaveBeenCalledWith("X-Cache", "MISS");
    });

    it("passes search param to model", async () => {
      req.query = { search: "matrix" };
      getMovies.mockResolvedValue({
        movies: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      });

      await listMovies(req, res, next);

      expect(getMovies).toHaveBeenCalledWith(
        expect.objectContaining({ search: "matrix" }),
      );
    });

    it("passes sort param to model", async () => {
      req.query = { sort: "price-asc" };
      getMovies.mockResolvedValue({
        movies: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      });

      await listMovies(req, res, next);

      expect(getMovies).toHaveBeenCalledWith(
        expect.objectContaining({ sort: "price-asc" }),
      );
    });

    it("passes duration filter to model", async () => {
      req.query = { duration: "short" };
      getMovies.mockResolvedValue({
        movies: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      });

      await listMovies(req, res, next);

      expect(getMovies).toHaveBeenCalledWith(
        expect.objectContaining({ duration: "short" }),
      );
    });

    it("passes price filter to model", async () => {
      req.query = { price: "low" };
      getMovies.mockResolvedValue({
        movies: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      });

      await listMovies(req, res, next);

      expect(getMovies).toHaveBeenCalledWith(
        expect.objectContaining({ price: "low" }),
      );
    });

    it("passes studio filter to model", async () => {
      req.query = { studio: "Studio 1" };
      getMovies.mockResolvedValue({
        movies: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      });

      await listMovies(req, res, next);

      expect(getMovies).toHaveBeenCalledWith(
        expect.objectContaining({ studio: "Studio 1" }),
      );
    });

    it("passes time filter to model", async () => {
      req.query = { time: "morning" };
      getMovies.mockResolvedValue({
        movies: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      });

      await listMovies(req, res, next);

      expect(getMovies).toHaveBeenCalledWith(
        expect.objectContaining({ time: "morning" }),
      );
    });

    it("passes pagination params to model", async () => {
      req.query = { page: "2", limit: "24" };
      getMovies.mockResolvedValue({
        movies: [],
        total: 0,
        page: 2,
        limit: 24,
        totalPages: 0,
      });

      await listMovies(req, res, next);

      expect(getMovies).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 24 }),
      );
    });

    it("defaults page to 1 when invalid", async () => {
      req.query = { page: "invalid" };
      getMovies.mockResolvedValue({
        movies: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      });

      await listMovies(req, res, next);

      expect(getMovies).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 }),
      );
    });

    it("limits max page size to 50", async () => {
      req.query = { limit: "100" };
      getMovies.mockResolvedValue({
        movies: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      });

      await listMovies(req, res, next);

      expect(getMovies).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 }),
      );
    });

    it("defaults limit to 12 when zero (invalid)", async () => {
      req.query = { limit: "0" };
      getMovies.mockResolvedValue({
        movies: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      });

      await listMovies(req, res, next);

      expect(getMovies).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 12 }),
      );
    });

    it("calls next with error on database failure", async () => {
      const error = new Error("Database error");
      getMovies.mockRejectedValue(error);

      await listMovies(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

describe("getMovie", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {} };
    res = { json: vi.fn(), set: vi.fn().mockReturnThis() };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("returns 400 for invalid movie id", async () => {
    req.params.id = "invalid";
    await getMovie(req, res, next);
    expect(sendError).toHaveBeenCalledWith(
      res,
      400,
      "Movie must be a valid id",
    );
  });

  it("returns 404 when movie not found", async () => {
    req.params.id = "1";
    getMovieById.mockResolvedValue(null);
    await getMovie(req, res, next);
    expect(sendError).toHaveBeenCalledWith(res, 404, "Movie not found");
  });

  it("returns movie when found", async () => {
    const mockMovie = { id: 1, title: "Test Movie", duration: 120 };
    req.params.id = "1";
    getMovieById.mockResolvedValue(mockMovie);
    await getMovie(req, res, next);
    expect(res.json).toHaveBeenCalledWith(mockMovie);
  });

  it("returns cached movie when available", async () => {
    const { get } = await import("../lib/cache.js");
    const cachedMovie = { id: 1, title: "Cached Movie" };
    get.mockReturnValueOnce(cachedMovie);
    req.params.id = "1";
    await getMovie(req, res, next);
    expect(res.json).toHaveBeenCalledWith(cachedMovie);
    expect(res.set).toHaveBeenCalledWith("X-Cache", "HIT");
  });

  it("calls next with error on database failure", async () => {
    req.params.id = "1";
    const error = new Error("Database error");
    getMovieById.mockRejectedValue(error);
    await getMovie(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("addMovie", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    req.body = { title: "" };
    await addMovie(req, res, next);
    expect(sendError).toHaveBeenCalledWith(
      res,
      400,
      "Title and duration are required",
    );
  });

  it("creates movie successfully", async () => {
    const mockMovie = { id: 1, title: "New Movie", duration: 120 };
    req.body = { title: "New Movie", duration: 120 };
    createMovie.mockResolvedValue(mockMovie);
    await addMovie(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockMovie);
  });

  it("invalidates movie cache on create", async () => {
    const { invalidatePrefix } = await import("../lib/cache.js");
    req.body = { title: "New Movie", duration: 120 };
    createMovie.mockResolvedValue({ id: 1 });
    await addMovie(req, res, next);
    expect(invalidatePrefix).toHaveBeenCalledWith("movies:");
  });

  it("calls next with error on database failure", async () => {
    req.body = { title: "New Movie", duration: 120 };
    const error = new Error("Database error");
    createMovie.mockRejectedValue(error);
    await addMovie(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("editMovie", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = { json: vi.fn() };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("returns 400 for invalid movie id", async () => {
    req.params.id = "invalid";
    await editMovie(req, res, next);
    expect(sendError).toHaveBeenCalledWith(
      res,
      400,
      "Movie must be a valid id",
    );
  });

  it("returns 404 when movie not found", async () => {
    req.params.id = "1";
    updateMovie.mockResolvedValue(null);
    await editMovie(req, res, next);
    expect(sendError).toHaveBeenCalledWith(res, 404, "Movie not found");
  });

  it("updates movie successfully", async () => {
    const mockMovie = { id: 1, title: "Updated Movie", duration: 120 };
    req.params.id = "1";
    req.body = { title: "Updated Movie" };
    updateMovie.mockResolvedValue(mockMovie);
    await editMovie(req, res, next);
    expect(res.json).toHaveBeenCalledWith(mockMovie);
  });

  it("invalidates movie cache on update", async () => {
    const { invalidatePrefix } = await import("../lib/cache.js");
    req.params.id = "1";
    req.body = { title: "Updated" };
    updateMovie.mockResolvedValue({ id: 1 });
    await editMovie(req, res, next);
    expect(invalidatePrefix).toHaveBeenCalledWith("movies:");
  });
});

describe("removeMovie", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {} };
    res = { json: vi.fn() };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("returns 400 for invalid movie id", async () => {
    req.params.id = "invalid";
    await removeMovie(req, res, next);
    expect(sendError).toHaveBeenCalledWith(
      res,
      400,
      "Movie must be a valid id",
    );
  });

  it("returns 404 when movie not found", async () => {
    req.params.id = "1";
    deleteMovie.mockResolvedValue(null);
    await removeMovie(req, res, next);
    expect(sendError).toHaveBeenCalledWith(res, 404, "Movie not found");
  });

  it("deletes movie successfully", async () => {
    const mockMovie = { id: 1, title: "Deleted Movie" };
    req.params.id = "1";
    deleteMovie.mockResolvedValue(mockMovie);
    await removeMovie(req, res, next);
    expect(res.json).toHaveBeenCalledWith(mockMovie);
  });

  it("invalidates movie cache on delete", async () => {
    const { invalidatePrefix } = await import("../lib/cache.js");
    req.params.id = "1";
    deleteMovie.mockResolvedValue({ id: 1 });
    await removeMovie(req, res, next);
    expect(invalidatePrefix).toHaveBeenCalledWith("movies:");
  });
});
