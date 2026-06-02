import { createContext, useContext, useState, useCallback } from "react";

const UndoStackContext = createContext(null);

const MAX_STACK_SIZE = 5;

export function UndoStackProvider({ children }) {
  const [stack, setStack] = useState([]);

  /**
   * Push an undo action onto the stack.
   * Each action contains the data needed to re-book a cancelled seat.
   * Caps the stack at MAX_STACK_SIZE by removing the oldest entry.
   */
  const pushUndo = useCallback((action) => {
    setStack((prev) => {
      const newStack = [...prev, action];
      // Cap at MAX_STACK_SIZE — remove oldest (first) items
      if (newStack.length > MAX_STACK_SIZE) {
        return newStack.slice(newStack.length - MAX_STACK_SIZE);
      }
      return newStack;
    });
  }, []);

  /**
   * Pop the last undo action from the stack (LIFO).
   * Returns the action or undefined if stack is empty.
   */
  const popUndo = useCallback(() => {
    let action;
    setStack((prev) => {
      if (prev.length === 0) return prev;
      action = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    return action;
  }, []);

  /**
   * Peek at the last undo action without removing it.
   */
  const peekUndo = useCallback(() => {
    if (stack.length === 0) return null;
    return stack[stack.length - 1];
  }, [stack]);

  /**
   * Get the current stack size.
   */
  const getSize = useCallback(() => stack.length, [stack]);

  /**
   * Clear the entire stack.
   */
  const clearStack = useCallback(() => {
    setStack([]);
  }, []);

  return (
    <UndoStackContext.Provider
      value={{
        stack,
        pushUndo,
        popUndo,
        peekUndo,
        getSize,
        clearStack,
      }}
    >
      {children}
    </UndoStackContext.Provider>
  );
}

export function useUndoStack() {
  const context = useContext(UndoStackContext);
  if (!context) {
    throw new Error("useUndoStack must be used within an UndoStackProvider");
  }
  return context;
}
