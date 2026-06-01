import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { SeatSelectionSkeleton } from "../components/Skeleton";

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

const seatRows = ["A", "B", "C", "D", "E"];

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    apiRequest(`/schedules/${id}/seats`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBooking() {
    if (!selectedSeat) return;
    setSubmitError("");
    setSubmitting(true);

    try {
      const result = await apiRequest("/bookings", {
        method: "POST",
        body: JSON.stringify({
          scheduleId: Number(id),
          seatNumber: selectedSeat,
        }),
      });
      navigate(`/bookings/${result.booking.id}/confirmation`, {
        state: { booking: result.booking },
      });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <SeatSelectionSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">💺</div>
        <div className="alert alert-error max-w-md shadow-lg">{error}</div>
        <Link to="/" className="btn btn-outline btn-sm">
          Back to movies
        </Link>
      </div>
    );
  }

  if (!data || !data.schedule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">🔍</div>
        <h2 className="text-2xl font-bold">Schedule not found</h2>
        <Link to="/" className="btn btn-primary">
          Browse movies
        </Link>
      </div>
    );
  }

  const { schedule, availableSeats, bookedSeats } = data;
  const bookedSet = new Set(bookedSeats);
  const movie = schedule.movie;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Breadcrumb */}
      <nav className="text-sm breadcrumbs mb-6">
        <ul>
          <li>
            <Link to="/" className="link link-hover">
              Movies
            </Link>
          </li>
          <li>
            <Link to={`/schedules/${id}`} className="link link-hover">
              Schedule
            </Link>
          </li>
          <li>Select Seat</li>
        </ul>
      </nav>

      {/* Movie & Schedule Summary */}
      <div className="card bg-base-200 shadow-md mb-6">
        <div className="card-body p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold">{movie?.title || "Movie"}</h1>
              <p className="text-sm opacity-60 mt-0.5">
                {formatDateTime(schedule.showTime)} — {schedule.studio}
                {movie?.duration && ` — ${formatDuration(movie.duration)}`}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-base-300 border border-base-300 inline-block" />
                Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-primary/30 border border-primary inline-block" />
                Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-error/40 border border-error inline-block" />
                Booked
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Map */}
      <div className="card bg-base-200 shadow-md">
        {/* Screen Indicator */}
        <div className="pt-8 pb-4">
          <div className="w-3/4 mx-auto">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-transparent via-base-content/30 to-transparent" />
            <p className="text-center text-xs opacity-40 mt-1 uppercase tracking-widest">
              Screen
            </p>
          </div>
        </div>

        <div className="card-body pt-2 pb-8 px-6">
          <div className="flex flex-col items-center gap-2">
            {seatRows.map((row) => (
              <div key={row} className="flex items-center gap-2">
                <span className="w-5 text-xs font-semibold opacity-50 text-right">
                  {row}
                </span>
                <div className="flex gap-1.5">
                  {Array.from({ length: 8 }, (_, i) => {
                    const seat = `${row}${i + 1}`;
                    const isBooked = bookedSet.has(seat);
                    const isSelected = selectedSeat === seat;

                    return (
                      <button
                        key={seat}
                        disabled={isBooked}
                        onClick={() =>
                          setSelectedSeat(isSelected ? null : seat)
                        }
                        className={`
                          w-7 h-7 md:w-8 md:h-8 rounded text-[10px] font-medium
                          transition-all duration-150 flex items-center justify-center
                          ${
                            isBooked
                              ? "bg-error/20 text-error/50 cursor-not-allowed border border-error/30"
                              : isSelected
                                ? "bg-primary/30 text-primary border-2 border-primary scale-110 shadow-md"
                                : "bg-base-300 text-base-content/70 border border-base-300 hover:border-primary/50 hover:bg-base-100 cursor-pointer"
                          }
                        `}
                        title={`Seat ${seat}${isBooked ? " (booked)" : ""}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <span className="w-5 text-xs font-semibold opacity-50 text-left">
                  {row}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary & Action */}
      <div className="card bg-base-200 shadow-md mt-6">
        <div className="card-body p-4 md:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm opacity-60">Selected Seat</p>
              <p className="text-2xl font-bold">
                {selectedSeat ? (
                  <span className="text-primary">{selectedSeat}</span>
                ) : (
                  <span className="opacity-40">None</span>
                )}
              </p>
              {selectedSeat && (
                <p className="text-xs opacity-50 mt-0.5">
                  {availableSeats?.length || 0} seats still available
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
              {!user && (
                <div className="alert alert-warning text-sm py-2 w-full sm:w-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    <Link to="/login" className="link link-hover font-semibold">
                      Login
                    </Link>{" "}
                    to book a seat
                  </span>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!selectedSeat || !user || submitting}
                className="btn btn-primary btn-lg w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner" />
                    Booking...
                  </>
                ) : !selectedSeat ? (
                  "Select a seat"
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Confirm Booking — Seat {selectedSeat}
                  </>
                )}
              </button>
            </div>
          </div>

          {submitError && (
            <div className="alert alert-error text-sm mt-4 shadow-lg">
              {submitError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
