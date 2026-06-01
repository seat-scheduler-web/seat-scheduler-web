import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { MovieCardSkeleton } from "../components/Skeleton";

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
  "from-indigo-500 via-purple-500 to-pink-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-red-500",
  "from-blue-500 via-sky-500 to-violet-500",
  "from-rose-500 via-fuchsia-500 to-purple-500",
];

const movieGradientFades = [
  "from-indigo-500/20 via-purple-500/20 to-pink-500/20",
  "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
  "from-amber-500/20 via-orange-500/20 to-red-500/20",
  "from-blue-500/20 via-sky-500/20 to-violet-500/20",
  "from-rose-500/20 via-fuchsia-500/20 to-purple-500/20",
];

const genreColors = {
  Action: "badge-error",
  Adventure: "badge-warning",
  Comedy: "badge-success",
  Drama: "badge-info",
  Fantasy: "badge-accent",
  Horror: "badge-ghost",
  "Sci-Fi": "badge-primary",
  Thriller: "badge-secondary",
  Romance: "badge-error",
  Animation: "badge-warning",
  Documentary: "badge-info",
  Mystery: "badge-accent",
};

function getGenreColor(genre) {
  if (!genre) return "badge-soft";
  return genreColors[genre] || "badge-soft";
}

function HighlightText({ text, query }) {
  if (!query || !text) return <>{text}</>;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-warning/30 text-warning-content rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function MoviePoster({ movie, index }) {
  const gradient = movieGradients[index % movieGradients.length];
  const icons = ["🎬", "🎥", "🎞️", "🍿", "🎭", "🎪", "🎦", "📽️"];
  const icon = icons[index % icons.length];

  return (
    <div
      className={`relative h-44 md:h-52 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
    >
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5" />

      {/* Film icon */}
      <span className="text-6xl md:text-7xl opacity-80 drop-shadow-lg select-none">
        {icon}
      </span>

      {/* Gradient overlay at bottom for text readability */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-base-200 to-transparent" />

      {/* Duration badge on poster */}
      <div className="absolute top-3 right-3">
        <span className="badge badge-soft badge-sm bg-black/30 text-white border-0 backdrop-blur-sm">
          {formatDuration(movie.duration)}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    apiRequest("/movies")
      .then(setMovies)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies;

    const query = searchQuery.toLowerCase().trim();
    return movies.filter((movie) => {
      const titleMatch = movie.title?.toLowerCase().includes(query);
      const descMatch = movie.description?.toLowerCase().includes(query);
      const genreMatch = movie.genre?.toLowerCase().includes(query);
      return titleMatch || descMatch || genreMatch;
    });
  }, [movies, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Hero Skeleton */}
        <div className="hero min-h-[30vh] md:min-h-[35vh] bg-base-200 rounded-2xl animate-pulse">
          <div className="hero-content text-center">
            <div className="space-y-4">
              <div className="h-10 w-64 bg-base-300 rounded mx-auto" />
              <div className="h-5 w-80 bg-base-300 rounded mx-auto" />
              <div className="h-10 w-40 bg-base-300 rounded mx-auto mt-4" />
            </div>
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="h-12 bg-base-300 rounded-xl animate-pulse" />
        </div>

        {/* Movie Grid Skeleton */}
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
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
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="hero min-h-[30vh] md:min-h-[35vh] bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 rounded-2xl border border-base-300/50">
        <div className="hero-content text-center py-10 md:py-14">
          <div className="max-w-2xl space-y-4">
            <div className="flex justify-center gap-3 text-4xl md:text-5xl">
              <span>🎬</span>
              <span>🍿</span>
              <span>🎥</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Now Showing
            </h1>
            <p className="text-sm md:text-base opacity-70 max-w-md mx-auto leading-relaxed">
              Browse the latest movies and book your perfect seat. Your next
              cinematic experience awaits.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm opacity-60">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>
                {movies.length} movie{movies.length !== 1 ? "s" : ""} available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Movie Grid */}
      <section className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Search Input */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 opacity-40"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search movies by title, description, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10 pr-10 focus:input-primary transition-colors duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center opacity-40 hover:opacity-70 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-center text-sm opacity-50 mt-2">
              {filteredMovies.length} result
              {filteredMovies.length !== 1 ? "s" : ""} found
              {filteredMovies.length !== movies.length &&
                ` out of ${movies.length}`}
            </p>
          )}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {searchQuery ? "Search Results" : "All Movies"}
          </h2>
          <div className="flex items-center gap-2 text-sm opacity-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zM6 5.5a1 1 0 000 2h8a1 1 0 000-2H6zm0 3.5a1 1 0 000 2h8a1 1 0 000-2H6zm0 3.5a1 1 0 000 2h5a1 1 0 000-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <span>{filteredMovies.length} titles</span>
          </div>
        </div>

        {/* Empty State for Search */}
        {filteredMovies.length === 0 ? (
          <div className="hero min-h-[40vh]">
            <div className="hero-content text-center">
              <div className="max-w-md space-y-4">
                <div className="text-6xl">🔍</div>
                <h2 className="text-xl font-bold">No movies found</h2>
                <p className="opacity-60">
                  No results for "
                  <span className="font-semibold">{searchQuery}</span>". Try a
                  different search term.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn btn-outline btn-sm"
                >
                  Clear search
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMovies.map((movie, index) => {
              const gradient =
                movieGradientFades[index % movieGradientFades.length];
              const firstSchedule = movie.schedules?.[0];
              const genre = movie.genre;
              const genreColor = getGenreColor(genre);

              return (
                <div
                  key={movie.id}
                  className="card bg-base-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                >
                  {/* Movie Poster Placeholder */}
                  <MoviePoster movie={movie} index={index} />

                  <div className="card-body p-5">
                    {/* Genre Badge + Title Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {genre && (
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`badge ${genreColor} badge-xs`}>
                              <HighlightText text={genre} query={searchQuery} />
                            </span>
                          </div>
                        )}
                        <h2 className="card-title text-lg font-bold leading-tight group-hover:text-primary transition-colors duration-200">
                          <HighlightText
                            text={movie.title}
                            query={searchQuery}
                          />
                        </h2>
                      </div>
                    </div>

                    {/* Description */}
                    {movie.description && (
                      <p className="text-sm opacity-60 leading-relaxed mt-2 line-clamp-2">
                        <HighlightText
                          text={movie.description}
                          query={searchQuery}
                        />
                      </p>
                    )}

                    {/* Schedules Section */}
                    <div className="mt-4 pt-4 border-t border-base-300">
                      {movie.schedules && movie.schedules.length > 0 ? (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-50">
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
                                className="btn btn-outline btn-sm gap-1.5 hover:btn-primary hover:scale-105 transition-all duration-200"
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
                          <div className="flex flex-wrap gap-3 mt-3 text-xs opacity-50">
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
                        <div className="flex items-center gap-2 text-xs opacity-40">
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
        )}
      </section>
    </div>
  );
}
