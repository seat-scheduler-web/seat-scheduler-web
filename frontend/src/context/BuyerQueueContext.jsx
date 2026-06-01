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
  // queues is an object: { [scheduleId]: QueueEntry[] }
  const [queues, setQueues] = useState(() => loadQueuesFromStorage());

  // Persist to localStorage whenever queues change
  useEffect(() => {
    saveQueuesToStorage(queues);
  }, [queues]);

  /**
   * Add a user to the queue for a given schedule.
   * Returns the queue entry with position.
   */
  const joinQueue = useCallback((scheduleId, user) => {
    const key = String(scheduleId);
    setQueues((prev) => {
      const queue = prev[key] || [];
      // Check if user is already in the queue
      const existingIndex = queue.findIndex(
        (entry) => entry.username === user.username,
      );
      if (existingIndex !== -1) {
        // Already in queue — return existing entry
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

  /**
   * Remove the first person from the queue (FIFO dequeue).
   * Called when a booking is confirmed.
   * Returns the dequeued entry or null.
   */
  const advanceQueue = useCallback((scheduleId) => {
    const key = String(scheduleId);
    let dequeued = null;
    setQueues((prev) => {
      const queue = prev[key] || [];
      if (queue.length === 0) return prev;
      dequeued = queue[0];
      const newQueue = queue.slice(1);
      return {
        ...prev,
        [key]: newQueue,
      };
    });
    return dequeued;
  }, []);

  /**
   * Get the current queue for a schedule.
   */
  const getQueue = useCallback(
    (scheduleId) => {
      const key = String(scheduleId);
      return queues[key] || [];
    },
    [queues],
  );

  /**
   * Get the position of a user in the queue (1-indexed).
   * Returns 0 if not in queue, -1 if first in line.
   */
  const getPosition = useCallback(
    (scheduleId, username) => {
      const key = String(scheduleId);
      const queue = queues[key] || [];
      const index = queue.findIndex((entry) => entry.username === username);
      if (index === -1) return 0; // not in queue
      if (index === 0) return -1; // first in line
      return index + 1; // 1-indexed position
    },
    [queues],
  );

  /**
   * Check if a user is first in line.
   */
  const isFirstInLine = useCallback(
    (scheduleId, username) => {
      const key = String(scheduleId);
      const queue = queues[key] || [];
      return queue.length > 0 && queue[0].username === username;
    },
    [queues],
  );

  /**
   * Get the next person in line (first in queue).
   */
  const getNextInLine = useCallback(
    (scheduleId) => {
      const key = String(scheduleId);
      const queue = queues[key] || [];
      return queue.length > 0 ? queue[0] : null;
    },
    [queues],
  );

  /**
   * Remove a specific user from the queue (e.g., if they leave the page).
   */
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

  /**
   * Clear all queues (utility).
   */
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
