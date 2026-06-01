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

function formatShortDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PerforatedEdge({ position }) {
  const isTop = position === "top";
  const dots = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="relative w-full">
      {/* Dashed line */}
      <div
        className={`absolute left-4 right-4 border-dashed border-base-300 ${
          isTop ? "top-0 border-b" : "bottom-0 border-t"
        }`}
        style={{
          borderBottomWidth: isTop ? "2px" : "0",
          borderTopWidth: isTop ? "0" : "2px",
        }}
      />
      {/* Left circle cutout */}
      <div
        className={`absolute w-8 h-8 bg-base-100 rounded-full ${
          isTop ? "-top-4" : "-bottom-4"
        } -left-4`}
      />
      {/* Right circle cutout */}
      <div
        className={`absolute w-8 h-8 bg-base-100 rounded-full ${
          isTop ? "-top-4" : "-bottom-4"
        } -right-4`}
      />
      {/* Dots along the perforation */}
      <div className={`flex justify-between px-6 ${isTop ? "pt-0" : "pb-0"}`}>
        {dots.map((i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full bg-base-300 ${
              isTop ? "-mt-0.5" : "-mb-0.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function QRCodePlaceholder() {
  // Generate a simple QR-like pattern using a grid of squares
  const gridSize = 7;
  const pattern = [
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-3 rounded-lg shadow-inner">
        <div
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {pattern.flat().map((cell, i) => (
            <div
              key={i}
              className={`w-3 h-3 md:w-4 md:h-4 ${
                cell ? "bg-base-content" : "bg-white"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-xs opacity-40 text-center">
        Scan for ticket verification
      </p>
    </div>
  );
}

export default function BookingConfirmation() {
  const location = useLocation();
  const booking = location.state?.booking;

  function handlePrint() {
    window.print();
  }

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
      <div className="text-center mb-6 space-y-2">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-7 h-7 text-success"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-sm opacity-50">
          Your ticket has been reserved successfully
        </p>
      </div>

      {/* Ticket Card */}
      <div className="bg-base-200 rounded-2xl shadow-lg overflow-hidden print:shadow-none print:border print:border-base-300">
        {/* Top accent */}
        <div className="h-2 bg-gradient-to-r from-success/60 via-emerald-500/60 to-teal-500/60" />

        {/* Movie Title Section */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-base-300/50">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-40 mb-1">
            Movie
          </p>
          <h2 className="text-xl md:text-2xl font-bold">
            {movie?.title || "Movie"}
          </h2>
          {movie?.genre && (
            <span className="badge badge-soft badge-sm mt-2">
              {movie.genre}
            </span>
          )}
        </div>

        {/* Perforated edge top */}
        <PerforatedEdge position="top" />

        {/* Ticket Details */}
        <div className="px-6 py-5 space-y-4">
          {/* Date & Time Row */}
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-40">
                Date
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {schedule ? formatShortDate(schedule.showTime) : "—"}
              </p>
            </div>
            <div className="w-px h-8 bg-base-300" />
            <div className="text-center flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-40">
                Time
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {schedule ? formatShortTime(schedule.showTime) : "—"}
              </p>
            </div>
            <div className="w-px h-8 bg-base-300" />
            <div className="text-center flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-40">
                Studio
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {schedule?.studio || "—"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-base-300" />

          {/* Seat & Booking ID Row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-40">
                Seat
              </p>
              <p className="text-3xl font-extrabold text-primary mt-0.5">
                {booking.seatNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-40">
                Booking ID
              </p>
              <p className="text-sm font-mono font-semibold mt-0.5 opacity-60">
                #{booking.id}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-base-300" />

          {/* Status & User Row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-40">
                Status
              </p>
              <span className="badge badge-success badge-sm mt-1 gap-1">
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
            {booking.user && (
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-40">
                  Booked by
                </p>
                <p className="text-sm font-medium mt-0.5">
                  {booking.user.username}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Perforated edge bottom */}
        <PerforatedEdge position="bottom" />

        {/* QR Code Section */}
        <div className="px-6 py-5 bg-base-300/30 border-t border-base-300/50">
          <QRCodePlaceholder />
        </div>

        {/* Bottom accent */}
        <div className="h-1.5 bg-gradient-to-r from-success/40 via-emerald-500/40 to-teal-500/40" />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 print:hidden">
        <button
          onClick={handlePrint}
          className="btn btn-outline flex-1 gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0118 8.653v4.097A2.25 2.25 0 0115.75 15h-.241l.305 1.984A1.75 1.75 0 0114.084 19H5.915a1.75 1.75 0 01-1.73-2.016L4.492 15H4.25A2.25 2.25 0 012 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.126-.153V2.75zm6.5 0v3.507a32.35 32.35 0 00-5 0V2.75a.25.25 0 01.25-.25h4.5a.25.25 0 01.25.25zM4.25 7.5a.75.75 0 00-.75.75v4.097c0 .414.336.75.75.75h11.5a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75H4.25z"
              clipRule="evenodd"
            />
          </svg>
          Print Ticket
        </button>
        <Link
          to="/"
          className="btn btn-primary flex-1 gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
        >
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
        <Link
          to="/my-bookings"
          className="btn btn-outline flex-1 gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
        >
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
