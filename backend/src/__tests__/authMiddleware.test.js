import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import {
  authMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

// Mock the jwt module
vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

// Mock the userModel module
vi.mock("../models/userModel.js", () => ({
  getUserById: vi.fn(),
}));

// Mock the apiResponse module
vi.mock("../lib/apiResponse.js", () => ({
  sendError: vi.fn((res, status, message) => {
    res.statusCode = status;
    res.json({ error: message });
  }),
}));

// Mock the jwt module
vi.mock("../lib/jwt.js", () => ({
  getJwtSecret: vi.fn(() => "test-secret-key-that-is-32-chars!"),
}));

import { getUserById } from "../models/userModel.js";
import { sendError } from "../lib/apiResponse.js";

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      statusCode: 200,
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("returns 401 when no authorization header is present", async () => {
    await authMiddleware(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, 401, "Auth token is required");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when authorization header has no token", async () => {
    req.headers.authorization = "Bearer ";

    await authMiddleware(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, 401, "Auth token is required");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is expired", async () => {
    req.headers.authorization = "Bearer expired-token";
    jwt.verify.mockImplementation(() => {
      throw new jwt.TokenExpiredError("Token expired", new Date());
    });

    await authMiddleware(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, 401, "Invalid auth token");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    req.headers.authorization = "Bearer invalid-token";
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await authMiddleware(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, 401, "Invalid auth token");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when user not found", async () => {
    req.headers.authorization = "Bearer valid-token";
    jwt.verify.mockReturnValue({ id: 1 });
    getUserById.mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, 401, "Invalid auth token");
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next and sets req.user when token is valid", async () => {
    const mockUser = { id: 1, username: "testuser", email: "test@example.com" };
    req.headers.authorization = "Bearer valid-token";
    jwt.verify.mockReturnValue({ id: 1 });
    getUserById.mockResolvedValue(mockUser);

    await authMiddleware(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(req.userId).toBe(1);
    expect(next).toHaveBeenCalled();
    expect(sendError).not.toHaveBeenCalled();
  });

  it("verifies token with correct secret", async () => {
    req.headers.authorization = "Bearer valid-token";
    jwt.verify.mockReturnValue({ id: 1 });
    getUserById.mockResolvedValue({ id: 1, username: "test" });

    await authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "valid-token",
      "test-secret-key-that-is-32-chars!",
    );
  });
});

describe("adminMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      statusCode: 200,
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("returns 401 when no user is set on request", () => {
    adminMiddleware(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, 401, "Auth token is required");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when user is not an admin", () => {
    req.user = { id: 1, username: "user", role: "USER" };

    adminMiddleware(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      403,
      "Admin access is required",
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when user is an admin", () => {
    req.user = { id: 1, username: "admin", role: "ADMIN" };

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(sendError).not.toHaveBeenCalled();
  });
});
