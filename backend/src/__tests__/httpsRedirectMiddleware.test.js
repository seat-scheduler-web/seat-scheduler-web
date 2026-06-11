import { describe, it, expect, vi } from "vitest";
import {
  httpsRedirect,
  setHttpsSecurityHeaders,
} from "../middlewares/httpsRedirectMiddleware.js";

function createMockReq(secure = false, headers = {}) {
  return {
    secure,
    headers,
    url: "/test",
  };
}

function createMockRes() {
  return {
    redirect: vi.fn(),
    set: vi.fn(function () {
      return this;
    }),
  };
}

describe("httpsRedirectMiddleware", () => {
  describe("httpsRedirect", () => {
    it("should redirect HTTP to HTTPS in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const req = createMockReq(false, { host: "example.com" });
      const res = createMockRes();
      const next = vi.fn();

      httpsRedirect(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith(
        301,
        "https://example.com/test",
      );
      expect(next).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should not redirect in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const req = createMockReq(false, { host: "localhost:3000" });
      const res = createMockRes();
      const next = vi.fn();

      httpsRedirect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should not redirect when already secure", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const req = createMockReq(true, { host: "example.com" });
      const res = createMockRes();
      const next = vi.fn();

      httpsRedirect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should not redirect when x-forwarded-proto is https", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const req = createMockReq(false, {
        host: "example.com",
        "x-forwarded-proto": "https",
      });
      const res = createMockRes();
      const next = vi.fn();

      httpsRedirect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should redirect when x-forwarded-proto is http", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const req = createMockReq(false, {
        host: "example.com",
        "x-forwarded-proto": "http",
      });
      const res = createMockRes();
      const next = vi.fn();

      httpsRedirect(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith(
        301,
        "https://example.com/test",
      );
      expect(next).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("setHttpsSecurityHeaders", () => {
    it("should set HSTS header", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      setHttpsSecurityHeaders(req, res, next);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "Strict-Transport-Security": expect.stringContaining("max-age="),
        }),
      );
      expect(next).toHaveBeenCalled();
    });

    it("should set X-Frame-Options header", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      setHttpsSecurityHeaders(req, res, next);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Frame-Options": "DENY",
        }),
      );
    });

    it("should set X-Content-Type-Options header", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      setHttpsSecurityHeaders(req, res, next);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Content-Type-Options": "nosniff",
        }),
      );
    });

    it("should include includeSubDomains in HSTS", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      setHttpsSecurityHeaders(req, res, next);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "Strict-Transport-Security":
            expect.stringContaining("includeSubDomains"),
        }),
      );
    });

    it("should include preload in HSTS", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      setHttpsSecurityHeaders(req, res, next);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "Strict-Transport-Security": expect.stringContaining("preload"),
        }),
      );
    });
  });
});
