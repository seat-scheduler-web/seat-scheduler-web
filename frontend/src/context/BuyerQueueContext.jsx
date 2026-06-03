import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const BuyerQueueContext = createContext(null);

const STORAGE_KEY = "seat-scheduler-buyer-queue";

function loadQueuesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveQueuesToStorage(queues) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queues));
  } catch {
    // storage full or unavailable — silently fail
  }
}

export function BuyerQueueProvider({ children }) {
  const [queues, setQueues] = useState(() => loadQueuesFromStorage());

  useEffect(() => {
    saveQueuesToStorage(queues);
  }, [queues]);

  const joinQueue = useCallback((scheduleId, user) => {
    const key = String(scheduleId);
    setQueues((prev) => {
      const queue = prev[key] || [];
      const existingIndex = queue.findIndex(
        (entry) => entry.username === user.username,
      );
      if (existingIndex !== -1) {
        return prev;
      }
      const entry = {
        username: user.username,
        joinedAt: Date.now(),
      };
      return {
        ...prev,
        [key]: [...queue, entry],
      };
    });
  }, []);

  const advanceQueue = useCallback(
    (scheduleId) => {
      const key = String(scheduleId);
      const queue = queues[key] || [];
      if (queue.length === 0) return null;
      const dequeued = queue[0];
      setQueues((prev) => ({
        ...prev,
        [key]: queue.slice(1),
      }));
      return dequeued;
    },
    [queues],
  );

  const getQueue = useCallback(
    (scheduleId) => {
      const key = String(scheduleId);
      return queues[key] || [];
    },
    [queues],
  );

  const getPosition = useCallback(
    (scheduleId, username) => {
      const key = String(scheduleId);
      const queue = queues[key] || [];
      const index = queue.findIndex((entry) => entry.username === username);
      if (index === -1) return 0;
      if (index === 0) return -1;
      return index + 1;
    },
    [queues],
  );

  const isFirstInLine = useCallback(
    (scheduleId, username) => {
      const key = String(scheduleId);
      const queue = queues[key] || [];
      return queue.length > 0 && queue[0].username === username;
    },
    [queues],
  );

  const getNextInLine = useCallback(
    (scheduleId) => {
      const key = String(scheduleId);
      const queue = queues[key] || [];
      return queue.length > 0 ? queue[0] : null;
    },
    [queues],
  );

  const leaveQueue = useCallback((scheduleId, username) => {
    const key = String(scheduleId);
    setQueues((prev) => {
      const queue = prev[key] || [];
      const newQueue = queue.filter((entry) => entry.username !== username);
      return {
        ...prev,
        [key]: newQueue,
      };
    });
  }, []);

  const clearAllQueues = useCallback(() => {
    setQueues({});
  }, []);

  return (
    <BuyerQueueContext.Provider
      value={{
        queues,
        joinQueue,
        advanceQueue,
        getQueue,
        getPosition,
        isFirstInLine,
        getNextInLine,
        leaveQueue,
        clearAllQueues,
      }}
    >
      {children}
    </BuyerQueueContext.Provider>
  );
}

export function useBuyerQueue() {
  const context = useContext(BuyerQueueContext);
  if (!context) {
    throw new Error("useBuyerQueue must be used within a BuyerQueueProvider");
  }
  return context;
}
