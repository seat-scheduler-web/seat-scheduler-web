import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "../api/client";

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

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export default function ScheduleDetail() {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    apiRequest(`/schedules/${id}`)
      .then(setSchedule)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-sm opacity-60">Loading schedule details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">📅</div>
        <div className="alert alert-error max-w-md shadow-lg">{error}</div>
        <Link to="/" className="btn btn-outline btn-sm">
          Back to movies
        </Link>
      </div>
    );
  }

  if (!schedule) {
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

  const movie = schedule.movie;

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">🎬</div>
        <h2 className="text-2xl font-bold">Movie not found</h2>
        <p className="opacity-60">
          The movie for this schedule is no longer available.
        </p>
        <Link to="/" className="btn btn-primary">
          Browse movies
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
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
        </ul>
      </nav>

      {/* Schedule Card */}
      <div className="card bg-base-200 shadow-lg overflow-hidden">
        {/* Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-violet-500/40 via-purple-500/40 to-fuchsia-500/40" />

        <div className="card-body p-6 md:p-8">
          {/* Movie Title */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {movie.title}
          </h1>

          {/* Duration Badge */}
          {movie.duration && (
            <div className="mt-2">
              <span className="badge badge-soft badge-md">
                {formatDuration(movie.duration)}
              </span>
            </div>
          )}

          {/* Movie Description */}
          {movie.description && (
            <p className="mt-4 text-sm opacity-70 leading-relaxed">
              {movie.description}
            </p>
          )}

          {/* Divider */}
          <div className="divider my-6" />

          {/* Schedule Info */}
          <div className="space-y-4">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 text-primary"
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
                <p className="text-lg font-medium">
                  {formatDateTime(schedule.showTime)}
                </p>
              </div>
            </div>

            {/* Studio */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 text-secondary"
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
                <p className="text-lg font-medium">{schedule.studio}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="divider my-6" />

          {/* Action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/schedules/${id}/seats`}
              className="btn btn-primary btn-lg flex-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M4.5 2A2.5 2.5 0 002 4.5v3.879a2.5 2.5 0 00.732 1.767l7.5 7.5a2.5 2.5 0 003.536 0l3.878-3.878a2.5 2.5 0 000-3.536l-7.5-7.5A2.5 2.5 0 008.379 2H4.5zM6 5.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              </svg>
              Select Seat
            </Link>
            <Link to="/" className="btn btn-outline btn-lg">
              Back to Movies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
