import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../hooks/useDebounce";

describe("useDebounce", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("debounces value changes", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 300 } },
    );

    expect(result.current).toBe("initial");

    // Change value
    rerender({ value: "changed", delay: 300 });

    // Value should not have changed yet
    expect(result.current).toBe("initial");

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Now value should be updated
    expect(result.current).toBe("changed");

    vi.useRealTimers();
  });

  it("cancels pending debounce on new input", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 300 } },
    );

    // Change value multiple times quickly
    rerender({ value: "change1", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "change2", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "change3", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Value should still be initial (not enough time has passed)
    expect(result.current).toBe("initial");

    // Advance remaining time
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Now should have the last value
    expect(result.current).toBe("change3");

    vi.useRealTimers();
  });

  it("uses default delay of 300ms", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "changed" });

    // Not yet updated at 299ms
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("initial");

    // Updated at 300ms
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("changed");

    vi.useRealTimers();
  });

  it("respects custom delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } },
    );

    rerender({ value: "changed", delay: 500 });

    // Not yet updated at 400ms
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe("initial");

    // Updated at 500ms
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("changed");

    vi.useRealTimers();
  });

  it("handles rapid consecutive changes", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "", delay: 100 } },
    );

    // Simulate typing "hello" quickly
    rerender({ value: "h", delay: 100 });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: "he", delay: 100 });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: "hel", delay: 100 });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: "hell", delay: 100 });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: "hello", delay: 100 });

    // Should still be initial (not enough time since last change)
    expect(result.current).toBe("");

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Now should have final value
    expect(result.current).toBe("hello");

    vi.useRealTimers();
  });

  it("handles null and undefined values", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: null, delay: 100 } },
    );

    expect(result.current).toBeNull();

    rerender({ value: "text", delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("text");

    rerender({ value: null, delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBeNull();

    vi.useRealTimers();
  });

  it("handles object values", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: { query: "test" }, delay: 100 } },
    );

    expect(result.current).toEqual({ query: "test" });

    rerender({ value: { query: "updated" }, delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toEqual({ query: "updated" });

    vi.useRealTimers();
  });

  it("cleans up timer on unmount", () => {
    vi.useFakeTimers();
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 300 } },
    );

    rerender({ value: "changed", delay: 300 });

    // Unmount before debounce fires
    unmount();

    // Advance timers - should not throw
    act(() => {
      vi.advanceTimersByTime(300);
    });

    vi.useRealTimers();
  });
});
