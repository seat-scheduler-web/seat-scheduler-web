import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  BuyerQueueProvider,
  useBuyerQueue,
} from "../context/BuyerQueueContext";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

function wrapper({ children }) {
  return <BuyerQueueProvider>{children}</BuyerQueueProvider>;
}

describe("BuyerQueueContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("joinQueue", () => {
    it("adds a user to the queue", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      act(() => {
        result.current.joinQueue("1", { username: "alice" });
      });

      const queue = result.current.getQueue("1");
      expect(queue).toHaveLength(1);
      expect(queue[0].username).toBe("alice");
    });

    it("prevents duplicate entries", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      act(() => {
        result.current.joinQueue("1", { username: "alice" });
        result.current.joinQueue("1", { username: "alice" });
      });

      const queue = result.current.getQueue("1");
      expect(queue).toHaveLength(1);
    });

    it("maintains FIFO order", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      act(() => {
        result.current.joinQueue("1", { username: "alice" });
        result.current.joinQueue("1", { username: "bob" });
        result.current.joinQueue("1", { username: "charlie" });
      });

      const queue = result.current.getQueue("1");
      expect(queue).toHaveLength(3);
      expect(queue[0].username).toBe("alice");
      expect(queue[1].username).toBe("bob");
      expect(queue[2].username).toBe("charlie");
    });

    it("handles multiple schedule queues independently", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      act(() => {
        result.current.joinQueue("1", { username: "alice" });
        result.current.joinQueue("2", { username: "bob" });
      });

      expect(result.current.getQueue("1")).toHaveLength(1);
      expect(result.current.getQueue("2")).toHaveLength(1);
      expect(result.current.getQueue("1")[0].username).toBe("alice");
      expect(result.current.getQueue("2")[0].username).toBe("bob");
    });
  });

  describe("advanceQueue", () => {
    it("removes and returns the first user in queue", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      act(() => {
        result.current.joinQueue("1", { username: "alice" });
        result.current.joinQueue("1", { username: "bob" });
      });

      let dequeued;
      act(() => {
        dequeued = result.current.advanceQueue("1");
      });

      expect(dequeued.username).toBe("alice");
      expect(result.current.getQueue("1")).toHaveLength(1);
      expect(result.current.getQueue("1")[0].username).toBe("bob");
    });

    it("returns null when queue is empty", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      let dequeued;
      act(() => {
        dequeued = result.current.advanceQueue("1");
      });

      expect(dequeued).toBeNull();
    });
  });

  describe("getPosition", () => {
    it("returns -1 for first in line", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      act(() => {
        result.current.joinQueue("1", { username: "alice" });
      });

      expect(result.current.getPosition("1", "alice")).toBe(-1);
    });

    it("returns position for others in queue", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      act(() => {
        result.current.joinQueue("1", { username: "alice" });
        result.current.joinQueue("1", { username: "bob" });
        result.current.joinQueue("1", { username: "charlie" });
      });

      expect(result.current.getPosition("1", "bob")).toBe(2);
      expect(result.current.getPosition("1", "charlie")).toBe(3);
    });

    it("returns 0 for user not in queue", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      expect(result.current.getPosition("1", "unknown")).toBe(0);
    });
  });

  describe("isFirstInLine", () => {
    it("returns true for first user", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      act(() => {
        result.current.joinQueue("1", { username: "alice" });
        result.current.joinQueue("1", { username: "bob" });
      });

      expect(result.current.isFirstInLine("1", "alice")).toBe(true);
      expect(result.current.isFirstInLine("1", "bob")).toBe(false);
    });

    it("returns false when queue is empty", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      expect(result.current.isFirstInLine("1", "alice")).toBe(false);
    });
  });

  describe("getNextInLine", () => {
    it("returns first user without removing them", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      act(() => {
        result.current.joinQueue("1", { username: "alice" });
      });

      const next = result.current.getNextInLine("1");
      expect(next.username).toBe("alice");
      expect(result.current.getQueue("1")).toHaveLength(1);
    });

    it("returns null when queue is empty", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      expect(result.current.getNextInLine("1")).toBeNull();
    });
  });

  describe("leaveQueue", () => {
    it("removes user from queue", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      act(() => {
        result.current.joinQueue("1", { username: "alice" });
        result.current.joinQueue("1", { username: "bob" });
      });

      act(() => {
        result.current.leaveQueue("1", "alice");
      });

      expect(result.current.getQueue("1")).toHaveLength(1);
      expect(result.current.getQueue("1")[0].username).toBe("bob");
    });
  });

  describe("clearAllQueues", () => {
    it("clears all queues", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      act(() => {
        result.current.joinQueue("1", { username: "alice" });
        result.current.joinQueue("2", { username: "bob" });
      });

      act(() => {
        result.current.clearAllQueues();
      });

      expect(result.current.getQueue("1")).toHaveLength(0);
      expect(result.current.getQueue("2")).toHaveLength(0);
    });
  });

  describe("localStorage persistence", () => {
    it("saves to localStorage when queue changes", () => {
      const { result } = renderHook(() => useBuyerQueue(), { wrapper });

      act(() => {
        result.current.joinQueue("1", { username: "alice" });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "seat-scheduler-buyer-queue",
        expect.any(String),
      );
    });
  });
});
