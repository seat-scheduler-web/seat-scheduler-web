import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit, RATE_LIMITS } from "../middlewares/rateLimitMiddleware.js";

function createMockRes() {
  const headers = {};
  const res = {
    set: vi.fn((key, value) => {
      if (typeof key === "object") {
        Object.assign(headers, key);
      } else {
        headers[key] = value;
      }
      return res;
    }),
    status: vi.fn(() => res),
    json: vi.fn(() => res),
    headers,
  };
  return res;
}

function createMockReq(path = "/api/test", method = "GET", ip = "127.0.0.1") {
  return {
    path,
    method,
    ip,
    connection: { remoteAddress: ip },
  };
}

describe("rateLimitMiddleware", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("RATE_LIMITS configuration", () => {
    it("should have auth limits configured correctly", () => {
      expect(RATE_LIMITS.auth.windowMs).toBe(15 * 60 * 1000);
      expect(RATE_LIMITS.auth.maxRequests).toBe(5);
    });

    it("should have api limits configured correctly", () => {
      expect(RATE_LIMITS.api.windowMs).toBe(60 * 1000);
      expect(RATE_LIMITS.api.maxRequests).toBe(60);
    });
  });

  describe("rateLimit middleware", () => {
    it("should allow requests within limit", () => {
      const middleware = rateLimit("api");
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-RateLimit-Limit": 60,
          "X-RateLimit-Remaining": 59,
        }),
      );
    });

    it("should set rate limit headers on each request", () => {
      const middleware = rateLimit("api");
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      middleware(req, res, next);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-RateLimit-Limit": expect.any(Number),
          "X-RateLimit-Remaining": expect.any(Number),
          "X-RateLimit-Reset": expect.any(String),
        }),
      );
    });

    it("should block requests exceeding the limit", () => {
      const middleware = rateLimit("api");
      const res = createMockRes();
      const next = vi.fn();

      for (let i = 0; i < 61; i++) {
        const req = createMockReq();
        middleware(req, createMockRes(), next);
      }

      const lastReq = createMockReq();
      const lastRes = createMockRes();
      middleware(lastReq, lastRes, next);

      expect(lastRes.status).toHaveBeenCalledWith(429);
      expect(lastRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Too many requests",
        }),
      );
    });

    it("should reset limit after window expires", () => {
      const middleware = rateLimit("api");
      const next = vi.fn();

      for (let i = 0; i < 60; i++) {
        middleware(createMockReq(), createMockRes(), next);
      }

      vi.advanceTimersByTime(61 * 1000);

      const res = createMockRes();
      middleware(createMockReq(), res, next);

      expect(next).toHaveBeenCalled();
      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-RateLimit-Remaining": 59,
        }),
      );
    });

    it("should track different IPs separately", () => {
      const middleware = rateLimit("api");
      const next = vi.fn();

      for (let i = 0; i < 60; i++) {
        middleware(
          createMockReq("/api/test", "GET", "192.168.1.1"),
          createMockRes(),
          next,
        );
      }

      const res = createMockRes();
      middleware(createMockReq("/api/test", "GET", "192.168.1.2"), res, next);

      expect(next).toHaveBeenCalled();
      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-RateLimit-Remaining": 59,
        }),
      );
    });

    it("should use stricter limits for auth endpoints", () => {
      const middleware = rateLimit("auth");
      const next = vi.fn();

      for (let i = 0; i < 5; i++) {
        middleware(createMockReq(), createMockRes(), next);
      }

      const res = createMockRes();
      middleware(createMockReq(), res, next);

      expect(res.status).toHaveBeenCalledWith(429);
    });

    it("should include Retry-After header when rate limited", () => {
      const middleware = rateLimit("api");
      const next = vi.fn();

      for (let i = 0; i < 61; i++) {
        middleware(createMockReq(), createMockRes(), next);
      }

      const res = createMockRes();
      middleware(createMockReq(), res, next);

      expect(res.set).toHaveBeenCalledWith("Retry-After", expect.any(Number));
    });
  });
});
