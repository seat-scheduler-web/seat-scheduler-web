import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { UndoStackProvider, useUndoStack } from "../context/UndoStackContext";

function wrapper({ children }) {
  return <UndoStackProvider>{children}</UndoStackProvider>;
}

describe("UndoStackContext", () => {
  describe("pushUndo", () => {
    it("adds an action to the stack", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      act(() => {
        result.current.pushUndo({ type: "BOOKING", data: { id: 1 } });
      });

      expect(result.current.getSize()).toBe(1);
      expect(result.current.peekUndo()).toEqual({
        type: "BOOKING",
        data: { id: 1 },
      });
    });

    it("maintains LIFO order", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      act(() => {
        result.current.pushUndo({ type: "ACTION_1" });
        result.current.pushUndo({ type: "ACTION_2" });
        result.current.pushUndo({ type: "ACTION_3" });
      });

      expect(result.current.getSize()).toBe(3);
      expect(result.current.peekUndo()).toEqual({ type: "ACTION_3" });
    });

    it("caps stack size at 5", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      act(() => {
        for (let i = 1; i <= 7; i++) {
          result.current.pushUndo({ type: `ACTION_${i}` });
        }
      });

      expect(result.current.getSize()).toBe(5);
      // Oldest items should be removed
      expect(result.current.peekUndo()).toEqual({ type: "ACTION_7" });
    });

    it("removes oldest items when exceeding max size", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      act(() => {
        for (let i = 1; i <= 6; i++) {
          result.current.pushUndo({ type: `ACTION_${i}` });
        }
      });

      expect(result.current.getSize()).toBe(5);
      // ACTION_1 should be removed, ACTION_2 should be at the bottom
      const stack = result.current.stack;
      expect(stack[0]).toEqual({ type: "ACTION_2" });
      expect(stack[4]).toEqual({ type: "ACTION_6" });
    });
  });

  describe("popUndo", () => {
    it("removes and returns an action", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      act(() => {
        result.current.pushUndo({ type: "ACTION_1" });
        result.current.pushUndo({ type: "ACTION_2" });
      });

      let popped;
      act(() => {
        popped = result.current.popUndo();
      });

      // popUndo returns the last action
      expect(popped).toBeDefined();
      expect(result.current.getSize()).toBe(1);
    });

    it("returns undefined when stack is empty", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      let popped;
      act(() => {
        popped = result.current.popUndo();
      });

      expect(popped).toBeUndefined();
    });

    it("reduces stack size when popping", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      act(() => {
        result.current.pushUndo({ type: "ACTION_1" });
        result.current.pushUndo({ type: "ACTION_2" });
        result.current.pushUndo({ type: "ACTION_3" });
      });

      act(() => {
        result.current.popUndo();
      });

      expect(result.current.getSize()).toBe(2);
    });
  });

  describe("peekUndo", () => {
    it("returns the last action without removing it", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      act(() => {
        result.current.pushUndo({ type: "ACTION_1" });
      });

      const peeked = result.current.peekUndo();
      expect(peeked).toEqual({ type: "ACTION_1" });
      expect(result.current.getSize()).toBe(1);
    });

    it("returns null when stack is empty", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      expect(result.current.peekUndo()).toBeNull();
    });
  });

  describe("getSize", () => {
    it("returns 0 for empty stack", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      expect(result.current.getSize()).toBe(0);
    });

    it("returns correct size after pushes", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      act(() => {
        result.current.pushUndo({ type: "ACTION_1" });
        result.current.pushUndo({ type: "ACTION_2" });
      });

      expect(result.current.getSize()).toBe(2);
    });

    it("returns correct size after clear", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      act(() => {
        result.current.pushUndo({ type: "ACTION_1" });
        result.current.pushUndo({ type: "ACTION_2" });
        result.current.clearStack();
      });

      expect(result.current.getSize()).toBe(0);
    });
  });

  describe("clearStack", () => {
    it("removes all items from the stack", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      act(() => {
        result.current.pushUndo({ type: "ACTION_1" });
        result.current.pushUndo({ type: "ACTION_2" });
        result.current.pushUndo({ type: "ACTION_3" });
      });

      act(() => {
        result.current.clearStack();
      });

      expect(result.current.getSize()).toBe(0);
      expect(result.current.peekUndo()).toBeNull();
    });

    it("works on empty stack", () => {
      const { result } = renderHook(() => useUndoStack(), { wrapper });

      act(() => {
        result.current.clearStack();
      });

      expect(result.current.getSize()).toBe(0);
    });
  });
});
