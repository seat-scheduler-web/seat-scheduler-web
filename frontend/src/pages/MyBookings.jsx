import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useToast } from "../components/Toast";
import { MyBookingsSkeleton } from "../components/Skeleton";

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyBookings() {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    apiRequest("/bookings")
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(bookingId) {
    setCancellingId(bookingId);
    try {
      await apiRequest(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "CANCELLED" } : b,
        ),
      );
      addToast("Booking cancelled successfully", "success");
    } catch (err) {
      setError(err.message);
      addToast(err.message, "error");
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return <MyBookingsSkeleton />;
  }

  if (error && !bookings.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">🎫</div>
        <div className="alert alert-error max-w-md shadow-lg">{error}</div>
        <Link to="/" className="btn btn-outline btn-sm">
          Browse movies
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-sm opacity-60 mt-1">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/" className="btn btn-outline btn-sm gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
              clipRule="evenodd"
            />
          </svg>
          Browse Movies
        </Link>
      </div>

      {/* Bookings List */}
      {!bookings.length ? (
        <div className="hero min-h-[40vh]">
          <div className="hero-content text-center">
            <div className="max-w-md space-y-4">
              <div className="text-7xl">🎟️</div>
              <h2 className="text-2xl font-bold">No bookings yet</h2>
              <p className="opacity-60">
                You haven't made any bookings. Browse movies and grab a seat!
              </p>
              <Link to="/" className="btn btn-primary">
                Browse Movies
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const schedule = booking.schedule;
            const movie = schedule?.movie;
            const isCancelled = booking.status === "CANCELLED";

            return (
              <div
                key={booking.id}
                className={`card bg-base-200 shadow-md transition-all duration-300 ${
                  isCancelled ? "opacity-60" : ""
                }`}
              >
                <div
                  className={`h-1.5 bg-gradient-to-r ${
                    isCancelled
                      ? "from-base-content/20 via-base-content/10 to-base-content/20"
                      : "from-primary/40 via-primary/30 to-secondary/40"
                  }`}
                />

                <div className="card-body p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Booking Info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Top Row: Movie + Status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold truncate">
                          {movie?.title || "Movie"}
                        </h3>
                        <span
                          className={`badge badge-sm ${
                            isCancelled ? "badge-soft" : "badge-success"
                          }`}
                        >
                          {isCancelled ? "Cancelled" : booking.status}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-70">
                        {schedule && (
                          <span className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {formatDateTime(schedule.showTime)}
                          </span>
                        )}
                        {schedule?.studio && (
                          <span className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zM6 5.5a1 1 0 000 2h8a1 1 0 000-2H6zm0 3.5a1 1 0 000 2h8a1 1 0 000-2H6zm0 3.5a1 1 0 000 2h5a1 1 0 000-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {schedule.studio}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2 4.5A2.5 2.5 0 014.5 2h11a2.5 2.5 0 012.5 2.5v11a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 012 15.5v-11zm8-1.5a5 5 0 100 10 5 5 0 000-10z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Seat {booking.seatNumber}
                        </span>
                      </div>
                    </div>

                    {/* Right: Action */}
                    <div className="flex items-center gap-2 md:shrink-0">
                      <span className="text-xs opacity-40 font-mono">
                        #{booking.id}
                      </span>
                      {!isCancelled && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="btn btn-outline btn-error btn-sm gap-1.5"
                        >
                          {cancellingId === booking.id ? (
                            <>
                              <span className="loading loading-spinner loading-xs" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c-.84 0-1.673.025-2.5.075V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v.325C11.673 4.025 10.84 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Cancel
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline error for cancellation failures */}
      {error && bookings.length > 0 && (
        <div className="alert alert-error text-sm shadow-lg">{error}</div>
      )}
    </div>
  );
}
