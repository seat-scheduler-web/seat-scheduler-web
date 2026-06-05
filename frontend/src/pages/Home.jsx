import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { MovieCardSkeleton, SectionSkeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { useBuyerQueue } from "../context/BuyerQueueContext";
import { useToast } from "../components/Toast";

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
  "from-cyan-500 via-blue-500 to-indigo-500",
  "from-pink-500 via-rose-500 to-red-500",
  "from-teal-500 via-emerald-500 to-green-500",
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

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "duration-asc", label: "Duration (Shortest)" },
  { value: "duration-desc", label: "Duration (Longest)" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "price-desc", label: "Price (High to Low)" },
  { value: "popularity", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

const DURATION_FILTERS = [
  { value: "all", label: "All Durations" },
  { value: "short", label: "Short (< 90 min)" },
  { value: "medium", label: "Medium (90-150 min)" },
  { value: "long", label: "Long (> 150 min)" },
];

const PRICE_FILTERS = [
  { value: "all", label: "All Prices" },
  { value: "low", label: "Under Rp 40,000" },
  { value: "medium", label: "Rp 40,000 - Rp 60,000" },
  { value: "high", label: "Above Rp 60,000" },
];

const TIME_FILTERS = [
  { value: "all", label: "All Times" },
  { value: "morning", label: "Morning (6AM - 12PM)" },
  { value: "afternoon", label: "Afternoon (12PM - 6PM)" },
  { value: "evening", label: "Evening (6PM+)" },
];

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

// Movie Poster Component - Larger and more prominent
function MoviePoster({ movie, index, size = "normal" }) {
  const gradient = movieGradients[index % movieGradients.length];
  const icons = ["🎬", "🎥", "🎞️", "🍿", "🎭", "🎪", "🎦", "📽️"];
  const icon = icons[index % icons.length];
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const hasPoster = movie.posterUrl && !imgError;
  const heightClass = size === "large" ? "h-64 md:h-80" : "h-52 md:h-60";

  return (
    <div
      className={`relative ${heightClass} bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
    >
      {hasPoster ? (
        <>
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-base-200 via-base-200/80 to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/5" />
          <span className="text-7xl md:text-8xl opacity-80 drop-shadow-lg select-none">
            {icon}
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-base-200 to-transparent" />
        </>
      )}

      {/* Duration badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="badge badge-soft badge-sm bg-black/40 text-white border-0 backdrop-blur-sm font-medium">
          {formatDuration(movie.duration)}
        </span>
      </div>

      {/* Genre badge */}
      {movie.genre && (
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`badge ${getGenreColor(movie.genre)} badge-sm backdrop-blur-sm`}
          >
            {movie.genre}
          </span>
        </div>
      )}
    </div>
  );
}

function getDurationCategory(minutes) {
  if (minutes < 90) return "short";
  if (minutes <= 150) return "medium";
  return "long";
}

// Horizontal scrolling section component
function ContentSection({
  title,
  icon,
  movies,
  loading,
  searchQuery,
  sectionType,
}) {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinQueue } = useBuyerQueue();
  const { addToast } = useToast();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return <SectionSkeleton />;
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {title}
          </h2>
          <span className="badge badge-soft badge-sm">{movies.length}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Scroll left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Scroll right"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-6 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {movies.map((movie, index) => {
          const firstSchedule = movie.schedules?.[0];

          return (
            <div
              key={movie.id}
              className="flex-none w-64 md:w-72 card bg-base-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <MoviePoster movie={movie} index={index} size="large" />

              <div className="card-body p-4">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {sectionType === "popular" && movie.bookingCount > 0 && (
                    <span className="badge badge-primary badge-xs">
                      🔥 {movie.bookingCount} booked
                    </span>
                  )}
                  {sectionType === "trending" && movie.recentBookings > 0 && (
                    <span className="badge badge-secondary badge-xs">
                      📈 {movie.recentBookings} recent
                    </span>
                  )}
                  {sectionType === "coming-soon" && firstSchedule && (
                    <span className="badge badge-accent badge-xs">
                      {formatDateTime(firstSchedule.showTime)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="card-title text-base font-bold leading-tight mt-2 group-hover:text-primary transition-colors duration-200 line-clamp-1">
                  <HighlightText text={movie.title} query={searchQuery} />
                </h3>

                {/* Description */}
                {movie.description && (
                  <p className="text-xs opacity-60 leading-relaxed mt-1 line-clamp-2">
                    <HighlightText
                      text={movie.description}
                      query={searchQuery}
                    />
                  </p>
                )}

                {/* Showtimes */}
                {movie.schedules && movie.schedules.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-base-300">
                    <div className="flex flex-wrap gap-1.5">
                      {movie.schedules.slice(0, 2).map((schedule) => (
                        <Link
                          key={schedule.id}
                          to={`/schedules/${schedule.id}`}
                          className="btn btn-outline btn-xs gap-1 hover:btn-primary transition-all duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3 h-3"
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
                      {movie.schedules.length > 2 && (
                        <span className="text-xs opacity-50 self-center">
                          +{movie.schedules.length - 2} more
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (!user) {
                          addToast("Please login to book a seat", "warning");
                          navigate("/login");
                          return;
                        }
                        joinQueue(movie.schedules[0].id, user);
                        addToast("Choose a showtime to pick your seat", "info");
                      }}
                      className="btn btn-primary btn-sm w-full mt-3 gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                      </svg>
                      {user ? "Book Now" : "Login to Book"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { joinQueue } = useBuyerQueue();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [movies, setMovies] = useState([]);
  const [sections, setSections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [durationFilter, setDurationFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [studioFilter, setStudioFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique studios from movies
  const availableStudios = useMemo(() => {
    const studios = new Set();
    movies.forEach((movie) => {
      movie.schedules?.forEach((schedule) => {
        if (schedule.studio) studios.add(schedule.studio);
      });
    });
    return Array.from(studios).sort();
  }, [movies]);

  useEffect(() => {
    // Fetch all movies for the main list
    apiRequest("/movies")
      .then(setMovies)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Fetch content sections
    apiRequest("/movies?view=sections")
      .then(setSections)
      .catch(() => setSections(null))
      .finally(() => setSectionsLoading(false));
  }, []);

  const processedMovies = useMemo(() => {
    let result = [...movies];

    // 1. Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((movie) => {
        const titleMatch = movie.title?.toLowerCase().includes(query);
        const descMatch = movie.description?.toLowerCase().includes(query);
        const genreMatch = movie.genre?.toLowerCase().includes(query);
        return titleMatch || descMatch || genreMatch;
      });
    }

    // 2. Duration filter
    if (durationFilter !== "all") {
      result = result.filter(
        (movie) => getDurationCategory(movie.duration) === durationFilter,
      );
    }

    // 3. Price filter
    if (priceFilter !== "all") {
      result = result.filter((movie) => {
        const prices = movie.schedules?.map((s) => s.price) || [];
        if (prices.length === 0) return false;
        const minPrice = Math.min(...prices);
        switch (priceFilter) {
          case "low":
            return minPrice < 40000;
          case "medium":
            return minPrice >= 40000 && minPrice <= 60000;
          case "high":
            return minPrice > 60000;
          default:
            return true;
        }
      });
    }

    // 4. Studio filter
    if (studioFilter !== "all") {
      result = result.filter((movie) =>
        movie.schedules?.some((s) => s.studio === studioFilter),
      );
    }

    // 5. Time of day filter
    if (timeFilter !== "all") {
      result = result.filter((movie) => {
        return movie.schedules?.some((schedule) => {
          const hour = new Date(schedule.showTime).getHours();
          switch (timeFilter) {
            case "morning":
              return hour >= 6 && hour < 12;
            case "afternoon":
              return hour >= 12 && hour < 18;
            case "evening":
              return hour >= 18 || hour < 6;
            default:
              return true;
          }
        });
      });
    }

    // 6. Sort
    switch (sortBy) {
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "duration-asc":
        result.sort((a, b) => a.duration - b.duration);
        break;
      case "duration-desc":
        result.sort((a, b) => b.duration - a.duration);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "price-asc":
        result.sort((a, b) => {
          const aPrice = Math.min(
            ...(a.schedules?.map((s) => s.price) || [Infinity]),
          );
          const bPrice = Math.min(
            ...(b.schedules?.map((s) => s.price) || [Infinity]),
          );
          return aPrice - bPrice;
        });
        break;
      case "price-desc":
        result.sort((a, b) => {
          const aPrice = Math.min(
            ...(a.schedules?.map((s) => s.price) || [Infinity]),
          );
          const bPrice = Math.min(
            ...(b.schedules?.map((s) => s.price) || [Infinity]),
          );
          return bPrice - aPrice;
        });
        break;
      case "popularity":
        result.sort((a, b) => {
          const aCount =
            a.schedules?.reduce(
              (acc, s) => acc + (s.bookings?.length || 0),
              0,
            ) || 0;
          const bCount =
            b.schedules?.reduce(
              (acc, s) => acc + (s.bookings?.length || 0),
              0,
            ) || 0;
          return bCount - aCount;
        });
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return result;
  }, [
    movies,
    searchQuery,
    sortBy,
    durationFilter,
    priceFilter,
    studioFilter,
    timeFilter,
  ]);

  const hasActiveFilters =
    searchQuery.trim() ||
    sortBy !== "default" ||
    durationFilter !== "all" ||
    priceFilter !== "all" ||
    studioFilter !== "all" ||
    timeFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSortBy("default");
    setDurationFilter("all");
    setPriceFilter("all");
    setStudioFilter("all");
    setTimeFilter("all");
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Hero Skeleton */}
        <div className="hero min-h-[40vh] bg-base-200 rounded-2xl animate-pulse">
          <div className="hero-content text-center">
            <div className="space-y-4">
              <div className="h-12 w-72 bg-base-300 rounded mx-auto" />
              <div className="h-5 w-96 bg-base-300 rounded mx-auto" />
              <div className="h-14 w-80 bg-base-300 rounded mx-auto mt-4" />
            </div>
          </div>
        </div>

        {/* Section Skeletons */}
        <div className="space-y-8">
          <SectionSkeleton />
          <SectionSkeleton />
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
      {/* Hero Banner with Integrated Search */}
      <section className="hero min-h-[40vh] md:min-h-[45vh] bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 rounded-2xl border border-base-300/50">
        <div className="hero-content text-center py-12 md:py-16">
          <div className="max-w-3xl space-y-6">
            <div className="flex justify-center gap-4 text-5xl md:text-6xl">
              <span>🎬</span>
              <span>🍿</span>
              <span>🎥</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Now Showing
            </h1>
            <p className="text-base md:text-lg opacity-70 max-w-lg mx-auto leading-relaxed">
              Browse the latest movies and book your perfect seat
            </p>

            {/* Prominent Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-6 h-6 opacity-50"
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
                  placeholder="Search movies, genres, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered input-lg w-full pl-12 pr-12 text-lg focus:input-primary shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center opacity-50 hover:opacity-80 transition-opacity"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm opacity-60">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>
                {movies.length} movie{movies.length !== 1 ? "s" : ""} available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections - Horizontal Scrolling */}
      {!sectionsLoading && sections && (
        <div className="space-y-6">
          {/* Now Popular */}
          <ContentSection
            title="Now Popular"
            icon="🔥"
            movies={sections.popular}
            loading={false}
            searchQuery={searchQuery}
            sectionType="popular"
          />

          {/* Trending */}
          <ContentSection
            title="Trending This Week"
            icon="📈"
            movies={sections.trending}
            loading={false}
            searchQuery={searchQuery}
            sectionType="trending"
          />

          {/* Coming Soon */}
          <ContentSection
            title="Coming Soon"
            icon="🎟️"
            movies={sections.comingSoon}
            loading={false}
            searchQuery={searchQuery}
            sectionType="coming-soon"
          />

          {/* Newest */}
          <ContentSection
            title="Newest Additions"
            icon="✨"
            movies={sections.newest}
            loading={false}
            searchQuery={searchQuery}
            sectionType="newest"
          />
        </div>
      )}

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="divider">
          <span className="text-lg font-semibold opacity-60">All Movies</span>
        </div>
      </div>

      {/* All Movies Section with Filters */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-8">
        {/* Filter Toggle & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {hasActiveFilters ? "Search Results" : "Browse All"}
            </h2>
            <span className="badge badge-soft badge-sm">
              {processedMovies.length}{" "}
              {processedMovies.length === 1 ? "title" : "titles"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-sm gap-2 ${showFilters ? "btn-primary" : "btn-ghost"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
                  clipRule="evenodd"
                />
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="badge badge-sm badge-primary">!</span>
              )}
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn btn-ghost btn-sm gap-1.5 text-sm opacity-60 hover:opacity-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="card bg-base-200 shadow-sm mb-6">
            <div className="card-body p-4 space-y-4">
              {/* First Row: Sort & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sort Dropdown */}
                <div>
                  <label className="label label-text text-sm opacity-60 mb-1">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="select select-bordered select-sm w-full focus:select-primary"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration Filter Dropdown */}
                <div>
                  <label className="label label-text text-sm opacity-60 mb-1">
                    Duration
                  </label>
                  <select
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value)}
                    className="select select-bordered select-sm w-full focus:select-primary"
                  >
                    {DURATION_FILTERS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Filter Dropdown */}
                <div>
                  <label className="label label-text text-sm opacity-60 mb-1">
                    Price
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="select select-bordered select-sm w-full focus:select-primary"
                  >
                    {PRICE_FILTERS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time of Day Filter Dropdown */}
                <div>
                  <label className="label label-text text-sm opacity-60 mb-1">
                    Time of Day
                  </label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="select select-bordered select-sm w-full focus:select-primary"
                  >
                    {TIME_FILTERS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Second Row: Studio Filter */}
              {availableStudios.length > 0 && (
                <div>
                  <label className="label label-text text-sm opacity-60 mb-1">
                    Studio
                  </label>
                  <select
                    value={studioFilter}
                    onChange={(e) => setStudioFilter(e.target.value)}
                    className="select select-bordered select-sm w-full sm:w-auto focus:select-primary"
                  >
                    <option value="all">All Studios</option>
                    {availableStudios.map((studio) => (
                      <option key={studio} value={studio}>
                        {studio}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {processedMovies.length === 0 ? (
          <div className="hero min-h-[40vh]">
            <div className="hero-content text-center">
              <div className="max-w-md space-y-4">
                <div className="text-6xl">🔍</div>
                <h2 className="text-xl font-bold">No movies found</h2>
                <p className="opacity-60">
                  {searchQuery.trim()
                    ? `No results for "${searchQuery}" with the current filters.`
                    : "No movies match the current filters."}{" "}
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="btn btn-outline btn-sm"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Movie Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedMovies.map((movie, index) => {
              const firstSchedule = movie.schedules?.[0];
              const genre = movie.genre;
              const genreColor = getGenreColor(genre);

              return (
                <div
                  key={movie.id}
                  className="card bg-base-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                >
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
                            {movie.schedules.slice(0, 3).map((schedule) => (
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
                            {movie.schedules.length > 3 && (
                              <span className="text-xs opacity-50 self-center">
                                +{movie.schedules.length - 3} more
                              </span>
                            )}
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

                      {/* Book Now Button */}
                      {movie.schedules && movie.schedules.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-base-300">
                          <button
                            onClick={() => {
                              if (!user) {
                                addToast(
                                  "Please login to book a seat",
                                  "warning",
                                );
                                navigate("/login");
                                return;
                              }
                              joinQueue(movie.schedules[0].id, user);
                              addToast(
                                "Choose a showtime below to pick your seat",
                                "info",
                              );
                            }}
                            className="btn btn-primary btn-sm w-full gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                            </svg>
                            {user ? "Book Now" : "Login to Book"}
                          </button>
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
