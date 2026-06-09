import { useEffect, useRef } from "react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "error", // error, warning, info
  loading = false,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const variantStyles = {
    error: {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
      iconBg: "bg-error/20",
      iconColor: "text-error",
      btnClass: "btn-error",
    },
    warning: {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
      iconBg: "bg-warning/20",
      iconColor: "text-warning",
      btnClass: "btn-warning",
    },
    info: {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
      iconBg: "bg-info/20",
      iconColor: "text-info",
      btnClass: "btn-info",
    },
  };

  const style = variantStyles[variant] || variantStyles.error;

  return (
    <dialog ref={dialogRef} className="modal" onClose={handleClose}>
      <div className="modal-box max-w-md">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-full ${style.iconBg} ${style.iconColor} flex items-center justify-center shrink-0`}
          >
            {style.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-sm opacity-70 mt-1">{message}</p>
          </div>
        </div>

        <div className="modal-action">
          <button
            onClick={handleClose}
            disabled={loading}
            className="btn btn-ghost"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`btn ${style.btnClass} gap-2`}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button disabled={loading}>close</button>
      </form>
    </dialog>
  );
}
