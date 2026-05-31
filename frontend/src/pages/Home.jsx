import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";

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

const movieGradients = [
  "from-indigo-500/20 via-purple-500/20 to-pink-500/20",
  "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
  "from-amber-500/20 via-orange-500/20 to-red-500/20",
  "from-blue-500/20 via-sky-500/20 to-violet-500/20",
  "from-rose-500/20 via-fuchsia-500/20 to-purple-500/20",
];

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/movies")
      .then(setMovies)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-sm opacity-60">Loading movies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">🎬</div>
        <div className="alert alert-error max-w-md shadow-lg">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-outline btn-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="hero min-h-[60vh]">
        <div className="hero-content text-center">
          <div className="max-w-md space-y-4">
            <div className="text-7xl">🎥</div>
            <h2 className="text-2xl font-bold">No movies available</h2>
            <p className="opacity-60">
              There are no movies currently showing. Check back later for new
              showtimes!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Now Showing
          </h1>
          <p className="text-sm opacity-60 mt-1">
            {movies.length} movie{movies.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <div className="text-4xl">🍿</div>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {movies.map((movie, index) => {
          const gradient = movieGradients[index % movieGradients.length];
          const firstSchedule = movie.schedules?.[0];

          return (
            <div
              key={movie.id}
              className="card bg-base-200 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Gradient Accent Bar */}
              <div className={`h-2 bg-gradient-to-r ${gradient}`} />

              <div className="card-body p-5">
                {/* Title Row */}
                <div className="flex items-start justify-between gap-3">
                  <h2 className="card-title text-xl font-bold">
                    {movie.title}
                  </h2>
                  <span className="badge badge-soft badge-sm whitespace-nowrap">
                    {formatDuration(movie.duration)}
                  </span>
                </div>

                {/* Description */}
                {movie.description && (
                  <p className="text-sm opacity-70 leading-relaxed mt-1">
                    {movie.description}
                  </p>
                )}

                {/* Schedules Section */}
                <div className="mt-4 pt-4 border-t border-base-300">
                  {movie.schedules && movie.schedules.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
                          Showtimes
                        </span>
                        <span className="badge badge-soft badge-xs">
                          {movie.schedules.length}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {movie.schedules.map((schedule) => (
                          <Link
                            key={schedule.id}
                            to={`/schedules/${schedule.id}`}
                            className="btn btn-outline btn-sm gap-1.5 hover:btn-primary transition-colors"
                          >
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
                          </Link>
                        ))}
                      </div>

                      {/* Quick Info Row */}
                      <div className="flex flex-wrap gap-3 mt-3 text-xs opacity-60">
                        {firstSchedule && (
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
                            {firstSchedule.studio}
                          </span>
                        )}
                        {movie.schedules.length > 1 && (
                          <span className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                            </svg>
                            {movie.schedules.length} options
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-xs opacity-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.5 3.5A1.5 1.5 0 017 2h1.5a1.5 1.5 0 011.5 1.5v2.25a1.5 1.5 0 01-1.5 1.5H7a1.5 1.5 0 01-1.5-1.5V3.5zM5.5 10.75A1.5 1.5 0 017 9.25h1.5a1.5 1.5 0 011.5 1.5v2.25a1.5 1.5 0 01-1.5 1.5H7a1.5 1.5 0 01-1.5-1.5v-2.25zM10.5 3.5A1.5 1.5 0 0112 2h1.5a1.5 1.5 0 011.5 1.5v2.25a1.5 1.5 0 01-1.5 1.5H12a1.5 1.5 0 01-1.5-1.5V3.5zM10.5 10.75A1.5 1.5 0 0112 9.25h1.5a1.5 1.5 0 011.5 1.5v2.25a1.5 1.5 0 01-1.5 1.5H12a1.5 1.5 0 01-1.5-1.5v-2.25z"
                          clipRule="evenodd"
                        />
                      </svg>
                      No schedules available yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
