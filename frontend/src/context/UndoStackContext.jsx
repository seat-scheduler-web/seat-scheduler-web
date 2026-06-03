import { createContext, useContext, useState, useCallback } from "react";

const UndoStackContext = createContext(null);

const MAX_STACK_SIZE = 5;

export function UndoStackProvider({ children }) {
  const [stack, setStack] = useState([]);

  const pushUndo = useCallback((action) => {
    setStack((prev) => {
      const newStack = [...prev, action];
      if (newStack.length > MAX_STACK_SIZE) {
        return newStack.slice(newStack.length - MAX_STACK_SIZE);
      }
      return newStack;
    });
  }, []);

  const popUndo = useCallback(() => {
    const currentStack = stack;
    if (currentStack.length === 0) return undefined;
    const action = currentStack[currentStack.length - 1];
    setStack(currentStack.slice(0, -1));
    return action;
  }, [stack]);

  const peekUndo = useCallback(() => {
    if (stack.length === 0) return null;
    return stack[stack.length - 1];
  }, [stack]);

  const getSize = useCallback(() => stack.length, [stack]);

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
