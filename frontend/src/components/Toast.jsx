import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

const ToastContext = createContext(null);

let toastId = 0;

function ToastIcon({ type }) {
  const iconClass = "w-5 h-5 shrink-0";

  switch (type) {
    case "success":
      return (
        <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
          <svg
            className={`${iconClass} text-success`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 101.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    case "error":
      return (
        <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center shrink-0">
          <svg
            className={`${iconClass} text-error`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    case "warning":
      return (
        <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
          <svg
            className={`${iconClass} text-warning`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center shrink-0">
          <svg
            className={`${iconClass} text-info`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
  }
}

function ProgressBar({ duration, isPaused, color, onComplete }) {
  const [progress, setProgress] = useState(100);
  const elapsedRef = useRef(0);
  const raf = useRef(null);
  const lastTimeRef = useRef(null);

  useEffect(() => {
    if (isPaused) {
      cancelAnimationFrame(raf.current);
      lastTimeRef.current = null;
      return;
    }

    function tick(now) {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      elapsedRef.current += delta;

      const pct = Math.max(0, 100 - (elapsedRef.current / duration) * 100);
      setProgress(pct);

      if (pct > 0) {
        raf.current = requestAnimationFrame(tick);
      } else {
        onComplete?.();
      }
    }

    lastTimeRef.current = null;
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [isPaused, duration, onComplete]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-base-300/30 rounded-b-lg overflow-hidden">
      <div
        className={`h-full transition-none ${color}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  }, [toast.id, onRemove]);

  const barColor =
    toast.type === "success"
      ? "bg-success"
      : toast.type === "error"
        ? "bg-error"
        : toast.type === "warning"
          ? "bg-warning"
          : "bg-info";

  return (
    <div
      className={`
        relative flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)]
        bg-base-100 rounded-xl shadow-xl border border-base-300/50
        overflow-hidden cursor-default
        transition-all duration-300 ease-out
        ${isExiting ? "opacity-0 translate-x-8 scale-95" : "opacity-100 translate-x-0 scale-100"}
      `}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4 flex-1 min-w-0">
        <ToastIcon type={toast.type} />
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-medium text-base-content leading-snug break-words">
            {toast.message}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="btn btn-ghost btn-xs btn-square opacity-40 hover:opacity-100 transition-opacity shrink-0 -mr-1 -mt-1"
          aria-label="Dismiss"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
      <ProgressBar
        duration={toast.duration}
        isPaused={isPaused}
        color={barColor}
        onComplete={handleRemove}
      />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            data-toast-id={toast.id}
            className="pointer-events-auto"
          >
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
