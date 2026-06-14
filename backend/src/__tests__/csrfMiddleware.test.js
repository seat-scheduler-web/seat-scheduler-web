import { describe, it, expect, vi } from "vitest";
import {
  csrfProtection,
  getCsrfToken,
  CSRF_HEADER_NAME,
} from "../middlewares/csrfMiddleware.js";

function createMockReq(method = "GET", cookies = {}, headers = {}) {
  return {
    method,
    cookies,
    headers,
  };
}

function createMockRes() {
  const cookies = {};
  return {
    cookie: vi.fn((name, value, options) => {
      cookies[name] = { value, options };
    }),
    locals: {},
    status: vi.fn(function () {
      return this;
    }),
    json: vi.fn(function () {
      return this;
    }),
    cookies,
  };
}

describe("csrfMiddleware", () => {
  describe("csrfProtection", () => {
    it("should set CSRF cookie for GET requests", () => {
      const req = createMockReq("GET");
      const res = createMockRes();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith(
        "csrf_token",
        expect.any(String),
        expect.objectContaining({
          httpOnly: false,
          sameSite: "none",
          secure: true,
          partitioned: true,
          path: "/",
        }),
      );
      expect(next).toHaveBeenCalled();
    });

    it("should set CSRF cookie for HEAD requests", () => {
      const req = createMockReq("HEAD");
      const res = createMockRes();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(res.cookie).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it("should set CSRF cookie for OPTIONS requests", () => {
      const req = createMockReq("OPTIONS");
      const res = createMockRes();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(res.cookie).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it("should accept valid CSRF token for POST requests", () => {
      const token = "valid-token-123";
      const req = createMockReq(
        "POST",
        { csrf_token: token },
        { "x-csrf-token": token },
      );
      const res = createMockRes();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should reject POST without CSRF header", () => {
      const req = createMockReq("POST", { csrf_token: "token" }, {});
      const res = createMockRes();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "CSRF validation failed",
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject POST without CSRF cookie", () => {
      const req = createMockReq("POST", {}, { "x-csrf-token": "token" });
      const res = createMockRes();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject POST with mismatched tokens", () => {
      const req = createMockReq(
        "POST",
        { csrf_token: "cookie-token" },
        { "x-csrf-token": "header-token" },
      );
      const res = createMockRes();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("should accept valid CSRF token for PATCH requests", () => {
      const token = "valid-token-456";
      const req = createMockReq(
        "PATCH",
        { csrf_token: token },
        { "x-csrf-token": token },
      );
      const res = createMockRes();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should accept valid CSRF token for DELETE requests", () => {
      const token = "valid-token-789";
      const req = createMockReq(
        "DELETE",
        { csrf_token: token },
        { "x-csrf-token": token },
      );
      const res = createMockRes();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should set secure flag in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const req = createMockReq("GET");
      const res = createMockRes();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith(
        "csrf_token",
        expect.any(String),
        expect.objectContaining({
          secure: true,
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("getCsrfToken", () => {
    it("should return existing token from cookie", () => {
      const req = createMockReq("GET", { csrf_token: "existing-token" });
      const res = createMockRes();

      const token = getCsrfToken(req, res);

      expect(token).toBe("existing-token");
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it("should generate new token if no cookie exists", () => {
      const req = createMockReq("GET", {});
      const res = createMockRes();

      const token = getCsrfToken(req, res);

      expect(token).toBeDefined();
      expect(token.length).toBe(64);
      expect(res.cookie).toHaveBeenCalled();
    });
  });

  describe("CSRF_HEADER_NAME", () => {
    it("should have correct header name", () => {
      expect(CSRF_HEADER_NAME).toBe("x-csrf-token");
    });
  });
});
