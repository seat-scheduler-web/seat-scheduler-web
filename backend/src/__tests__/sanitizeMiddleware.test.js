import { describe, it, expect, vi } from "vitest";
import {
  escapeHtml,
  sanitizeObject,
  sanitizeInput,
  setSecurityHeaders,
} from "../middlewares/sanitizeMiddleware.js";

function createMockReq(body = {}, query = {}, params = {}) {
  return { body, query, params };
}

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
    headers,
  };
  return res;
}

describe("sanitizeMiddleware", () => {
  describe("escapeHtml", () => {
    it("should escape ampersands", () => {
      expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
    });

    it("should escape less than signs", () => {
      expect(escapeHtml("foo < bar")).toBe("foo &lt; bar");
    });

    it("should escape greater than signs", () => {
      expect(escapeHtml("foo > bar")).toBe("foo &gt; bar");
    });

    it("should escape double quotes", () => {
      expect(escapeHtml('foo "bar"')).toBe("foo &quot;bar&quot;");
    });

    it("should escape single quotes", () => {
      expect(escapeHtml("foo 'bar'")).toBe("foo &#x27;bar&#x27;");
    });
    it("should escape forward slashes", () => {
      expect(escapeHtml("foo/bar")).toBe("foo&#x2F;bar");
    });

    it("should escape all XSS characters", () => {
      const input = '<script>alert("xss")</script>';
      const expected =
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;";
      expect(escapeHtml(input)).toBe(expected);
    });

    it("should return non-string values unchanged", () => {
      expect(escapeHtml(123)).toBe(123);
      expect(escapeHtml(null)).toBe(null);
      expect(escapeHtml(undefined)).toBe(undefined);
    });
  });

  describe("sanitizeObject", () => {
    it("should sanitize string values", () => {
      const input = { name: '<script>alert("xss")</script>' };
      const result = sanitizeObject(input);
      expect(result.name).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;",
      );
    });

    it("should trim whitespace from strings", () => {
      const input = { name: "  hello  " };
      const result = sanitizeObject(input);
      expect(result.name).toBe("hello");
    });

    it("should handle nested objects", () => {
      const input = { user: { name: "<b>bold</b>" } };
      const result = sanitizeObject(input);
      expect(result.user.name).toBe("&lt;b&gt;bold&lt;&#x2F;b&gt;");
    });

    it("should handle arrays", () => {
      const input = { tags: ["<script>", "<img>"] };
      const result = sanitizeObject(input);
      expect(result.tags).toEqual(["&lt;script&gt;", "&lt;img&gt;"]);
    });

    it("should preserve non-string values", () => {
      const input = { count: 42, active: true, data: null };
      const result = sanitizeObject(input);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
      expect(result.data).toBe(null);
    });
  });

  describe("sanitizeInput middleware", () => {
    it("should sanitize request body", () => {
      const req = createMockReq({ name: '<script>alert("xss")</script>' });
      const res = createMockRes();
      const next = vi.fn();

      sanitizeInput(req, res, next);

      expect(req.body.name).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;",
      );
      expect(next).toHaveBeenCalled();
    });

    it("should sanitize query parameters", () => {
      const req = createMockReq({}, { search: "<img src=x>" });
      const res = createMockRes();
      const next = vi.fn();

      sanitizeInput(req, res, next);

      expect(req.query.search).toBe("&lt;img src=x&gt;");
      expect(next).toHaveBeenCalled();
    });

    it("should sanitize URL params", () => {
      const req = createMockReq({}, {}, { id: "<script>" });
      const res = createMockRes();
      const next = vi.fn();

      sanitizeInput(req, res, next);

      expect(req.params.id).toBe("&lt;script&gt;");
      expect(next).toHaveBeenCalled();
    });

    it("should call next even with empty body", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      sanitizeInput(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("setSecurityHeaders middleware", () => {
    it("should set Content-Security-Policy header", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      setSecurityHeaders(req, res, next);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "Content-Security-Policy": "default-src 'self'",
        }),
      );
    });

    it("should set X-Content-Type-Options header", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      setSecurityHeaders(req, res, next);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Content-Type-Options": "nosniff",
        }),
      );
    });

    it("should set X-XSS-Protection header", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      setSecurityHeaders(req, res, next);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-XSS-Protection": "1; mode=block",
        }),
      );
    });

    it("should call next after setting headers", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      setSecurityHeaders(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
