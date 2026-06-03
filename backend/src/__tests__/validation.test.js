import { describe, it, expect } from "vitest";
import {
  hasRequiredFields,
  isPositiveId,
  isNonEmptyString,
  isValidDate,
} from "../lib/validation.js";

describe("hasRequiredFields", () => {
  it("returns true when all required fields are present", () => {
    const body = { name: "John", email: "john@example.com", age: 25 };
    expect(hasRequiredFields(body, ["name", "email"])).toBe(true);
  });

  it("returns false when a required field is missing", () => {
    const body = { name: "John" };
    expect(hasRequiredFields(body, ["name", "email"])).toBe(false);
  });

  it("returns false when a required field is empty string", () => {
    const body = { name: "John", email: "" };
    expect(hasRequiredFields(body, ["name", "email"])).toBe(false);
  });

  it("returns false when a required field is undefined", () => {
    const body = { name: "John", email: undefined };
    expect(hasRequiredFields(body, ["name", "email"])).toBe(false);
  });

  it("returns true when checking empty fields array", () => {
    const body = { name: "John" };
    expect(hasRequiredFields(body, [])).toBe(true);
  });

  it("returns false when body is empty but fields are required", () => {
    const body = {};
    expect(hasRequiredFields(body, ["name"])).toBe(false);
  });

  it("handles null values correctly", () => {
    const body = { name: null };
    // null is not undefined and not empty string, so it passes
    expect(hasRequiredFields(body, ["name"])).toBe(true);
  });
});

describe("isPositiveId", () => {
  it("returns true for positive integers", () => {
    expect(isPositiveId(1)).toBe(true);
    expect(isPositiveId(100)).toBe(true);
    expect(isPositiveId(999999)).toBe(true);
  });

  it("returns true for string representations of positive integers", () => {
    expect(isPositiveId("1")).toBe(true);
    expect(isPositiveId("42")).toBe(true);
  });

  it("returns false for zero", () => {
    expect(isPositiveId(0)).toBe(false);
    expect(isPositiveId("0")).toBe(false);
  });

  it("returns false for negative numbers", () => {
    expect(isPositiveId(-1)).toBe(false);
    expect(isPositiveId(-100)).toBe(false);
  });

  it("returns false for non-numeric strings", () => {
    expect(isPositiveId("abc")).toBe(false);
    expect(isPositiveId("")).toBe(false);
  });

  it("returns false for floats", () => {
    expect(isPositiveId(1.5)).toBe(false);
    expect(isPositiveId(3.14)).toBe(false);
  });

  it("returns false for null and undefined", () => {
    expect(isPositiveId(null)).toBe(false);
    expect(isPositiveId(undefined)).toBe(false);
  });
});

describe("isNonEmptyString", () => {
  it("returns true for non-empty strings", () => {
    expect(isNonEmptyString("hello")).toBe(true);
    expect(isNonEmptyString("a")).toBe(true);
    expect(isNonEmptyString("  trimmed  ")).toBe(true);
  });

  it("returns false for empty strings", () => {
    expect(isNonEmptyString("")).toBe(false);
  });

  it("returns false for whitespace-only strings", () => {
    expect(isNonEmptyString("   ")).toBe(false);
    expect(isNonEmptyString("\t")).toBe(false);
    expect(isNonEmptyString("\n")).toBe(false);
  });

  it("returns false for non-string types", () => {
    expect(isNonEmptyString(123)).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString({})).toBe(false);
    expect(isNonEmptyString([])).toBe(false);
  });
});

describe("isValidDate", () => {
  it("returns true for valid date strings", () => {
    expect(isValidDate("2024-01-01")).toBe(true);
    expect(isValidDate("2024-12-31T23:59:59Z")).toBe(true);
    expect(isValidDate("January 1, 2024")).toBe(true);
  });

  it("returns true for ISO date strings", () => {
    expect(isValidDate("2024-06-15T10:30:00.000Z")).toBe(true);
  });

  it("returns true for date objects", () => {
    expect(isValidDate(new Date())).toBe(true);
  });

  it("returns false for invalid date strings", () => {
    expect(isValidDate("not a date")).toBe(false);
    expect(isValidDate("")).toBe(false);
    expect(isValidDate("2024-13-01")).toBe(false); // Invalid month
  });

  it("returns false for non-date values", () => {
    expect(isValidDate(undefined)).toBe(false);
  });

  it("returns true for numeric timestamps", () => {
    // Numeric timestamps are valid dates in JavaScript
    expect(isValidDate(12345)).toBe(true);
  });

  it("returns true for null (treated as epoch)", () => {
    // null is treated as 0 in Date constructor (epoch)
    expect(isValidDate(null)).toBe(true);
  });
});
