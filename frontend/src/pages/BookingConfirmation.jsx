import { useLocation, Link } from "react-router-dom";

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BookingConfirmation() {
  const location = useLocation();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">🔍</div>
        <h2 className="text-2xl font-bold">No booking data</h2>
        <p className="opacity-60">
          This page should be reached after completing a booking.
        </p>
        <Link to="/" className="btn btn-primary">
          Browse movies
        </Link>
      </div>
    );
  }

  const movie = booking.schedule?.movie;
  const schedule = booking.schedule;

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6">
      {/* Success Header */}
      <div className="text-center mb-8 space-y-3">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-8 h-8 text-success"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
        <p className="text-sm opacity-60">
          Your seat has been reserved successfully.
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="card bg-base-200 shadow-lg overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-success/50 via-success/30 to-emerald-500/50" />

        <div className="card-body p-6 space-y-5">
          {/* Booking ID */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
              Booking ID
            </span>
            <span className="text-sm font-mono badge badge-soft badge-md">
              #{booking.id}
            </span>
          </div>

          <div className="divider my-0" />

          {/* Movie */}
          {movie && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-primary"
                >
                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  Movie
                </p>
                <p className="font-medium">{movie.title}</p>
              </div>
            </div>
          )}

          {/* Schedule */}
          {schedule && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-secondary"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  Date & Time
                </p>
                <p className="font-medium">
                  {formatDateTime(schedule.showTime)}
                </p>
              </div>
            </div>
          )}

          {/* Studio */}
          {schedule?.studio && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-accent"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zM6 5.5a1 1 0 000 2h8a1 1 0 000-2H6zm0 3.5a1 1 0 000 2h8a1 1 0 000-2H6zm0 3.5a1 1 0 000 2h5a1 1 0 000-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  Studio
                </p>
                <p className="font-medium">{schedule.studio}</p>
              </div>
            </div>
          )}

          {/* Seat Number */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-warning"
              >
                <path
                  fillRule="evenodd"
                  d="M2 4.5A2.5 2.5 0 014.5 2h11a2.5 2.5 0 012.5 2.5v11a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 012 15.5v-11zm8-1.5a5 5 0 100 10 5 5 0 000-10z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                Seat
              </p>
              <p className="text-2xl font-bold text-primary">
                {booking.seatNumber}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
              Status
            </span>
            <span className="badge badge-success badge-md gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3"
              >
                <path
                  fillRule="evenodd"
                  d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zM10 6.75a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5V7.5A.75.75 0 0110 6.75z"
                  clipRule="evenodd"
                />
              </svg>
              {booking.status}
            </span>
          </div>

          {/* User Info */}
          {booking.user && (
            <>
              <div className="divider my-0" />
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 text-info"
                  >
                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                    Booked by
                  </p>
                  <p className="font-medium">{booking.user.username}</p>
                  <p className="text-xs opacity-50">{booking.user.email}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link to="/" className="btn btn-primary flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
              clipRule="evenodd"
            />
          </svg>
          Back to Home
        </Link>
        <Link to="/my-bookings" className="btn btn-outline flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zm4.03 6.28a.75.75 0 00-1.06-1.06L4.97 9.47a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06-1.06L6.56 10l1.72-1.72zm4.5-1.06a.75.75 0 10-1.06 1.06L13.44 10l-1.72 1.72a.75.75 0 101.06 1.06l2.25-2.25a.75.75 0 000-1.06l-2.25-2.25z"
              clipRule="evenodd"
            />
          </svg>
          My Bookings
        </Link>
      </div>
    </div>
  );
}
