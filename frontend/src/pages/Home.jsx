import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { MovieCardSkeleton, SectionSkeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { useBuyerQueue } from "../context/BuyerQueueContext";
import { useToast } from "../components/Toast";
import { useDebounce } from "../hooks/useDebounce";
import Pagination from "../components/Pagination";

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

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
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

const ITEMS_PER_PAGE = 12;

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

      <div className="absolute top-3 right-3 z-10">
        <span className="badge badge-soft badge-sm bg-black/40 text-white border-0 backdrop-blur-sm font-medium">
          {formatDuration(movie.duration)}
        </span>
      </div>

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

  if (loading) return <SectionSkeleton />;
  if (!movies || movies.length === 0) return null;

  return (
    <section className="space-y-4">
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

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-6 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {movies.map((movie, index) => {
          const firstSchedule = movie.schedules?.[0];
          const minPrice =
            movie.schedules?.length > 0
              ? Math.min(...movie.schedules.map((s) => s.price))
              : null;
          const uniqueStudios = [
            ...new Set(movie.schedules?.map((s) => s.studio) || []),
          ];

          return (
            <div
              key={movie.id}
              className="flex-none w-64 md:w-72 card bg-base-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <MoviePoster movie={movie} index={index} size="large" />
              <div className="card-body p-4">
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
                  {movie.rating && (
                    <span className="badge badge-warning badge-xs font-bold">
                      ★ {movie.rating.toFixed(1)}
                    </span>
                  )}
                  {minPrice && (
                    <span className="badge badge-success badge-xs font-bold">
                      {formatPrice(minPrice)}
                    </span>
                  )}
                </div>

                <h3 className="card-title text-base font-bold leading-tight mt-2 group-hover:text-primary transition-colors duration-200 line-clamp-1">
                  <HighlightText text={movie.title} query={searchQuery} />
                </h3>

                {uniqueStudios.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs opacity-60">
                      {uniqueStudios.slice(0, 2).join(", ")}
                      {uniqueStudios.length > 2 &&
                        ` +${uniqueStudios.length - 2}`}
                    </span>
                  </div>
                )}

                {movie.description && (
                  <p className="text-xs opacity-60 leading-relaxed mt-1 line-clamp-2">
                    <HighlightText
                      text={movie.description}
                      query={searchQuery}
                    />
                  </p>
                )}

                {movie.schedules && movie.schedules.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-base-300">
                    <div className="flex flex-wrap gap-1.5">
                      {movie.schedules.slice(0, 2).map((schedule) => (
                        <Link
                          key={schedule.id}
                          to={`/schedules/${schedule.id}`}
                          className="btn btn-outline btn-xs gap-1 hover:btn-primary transition-all duration-200"
                        >
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

function ActiveFilterBadge({ label, onClear }) {
  return (
    <span className="badge badge-primary badge-sm gap-1">
      {label}
      <button onClick={onClear} className="hover:opacity-70">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3 h-3"
        >
          <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z" />
        </svg>
      </button>
    </span>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { joinQueue } = useBuyerQueue();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [moviesData, setMoviesData] = useState({
    movies: [],
    total: 0,
    page: 1,
    totalPages: 0,
  });
  const [sections, setSections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [sortBy, setSortBy] = useState("default");
  const [durationFilter, setDurationFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [studioFilter, setStudioFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const movies = moviesData.movies;

  // Get unique studios from current page of movies
  const availableStudios = useMemo(() => {
    const studios = new Set();
    movies.forEach((movie) => {
      movie.schedules?.forEach((schedule) => {
        if (schedule.studio) studios.add(schedule.studio);
      });
    });
    return Array.from(studios).sort();
  }, [movies]);

  // Build API URL with all filter params
  const buildApiUrl = useCallback(
    (page = 1) => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", ITEMS_PER_PAGE.toString());
      if (debouncedSearchQuery.trim())
        params.set("search", debouncedSearchQuery.trim());
      if (sortBy !== "default") params.set("sort", sortBy);
      if (durationFilter !== "all") params.set("duration", durationFilter);
      if (priceFilter !== "all") params.set("price", priceFilter);
      if (studioFilter !== "all") params.set("studio", studioFilter);
      if (timeFilter !== "all") params.set("time", timeFilter);
      return `/movies?${params.toString()}`;
    },
    [
      debouncedSearchQuery,
      sortBy,
      durationFilter,
      priceFilter,
      studioFilter,
      timeFilter,
    ],
  );

  // Fetch movies with pagination and filters from backend
  const fetchMovies = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const data = await apiRequest(buildApiUrl(page));
        setMoviesData({
          movies: data.movies || [],
          total: data.total || 0,
          page: data.page || page,
          totalPages: data.totalPages || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [buildApiUrl],
  );

  useEffect(() => {
    fetchMovies(currentPage);
    apiRequest("/movies?view=sections")
      .then(setSections)
      .catch(() => setSections(null))
      .finally(() => setSectionsLoading(false));
  }, [currentPage, fetchMovies]);

  // Track debounce loading state
  useEffect(() => {
    setIsSearching(searchQuery !== debouncedSearchQuery);
  }, [searchQuery, debouncedSearchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchQuery,
    sortBy,
    durationFilter,
    priceFilter,
    studioFilter,
    timeFilter,
  ]);

  const hasActiveFilters =
    debouncedSearchQuery.trim() ||
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
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterLabels = useMemo(() => {
    const labels = [];
    if (durationFilter !== "all") {
      labels.push({
        key: "duration",
        label: DURATION_FILTERS.find((f) => f.value === durationFilter)?.label,
      });
    }
    if (priceFilter !== "all") {
      labels.push({
        key: "price",
        label: PRICE_FILTERS.find((f) => f.value === priceFilter)?.label,
      });
    }
    if (studioFilter !== "all") {
      labels.push({ key: "studio", label: studioFilter });
    }
    if (timeFilter !== "all") {
      labels.push({
        key: "time",
        label: TIME_FILTERS.find((f) => f.value === timeFilter)?.label,
      });
    }
    return labels;
  }, [durationFilter, priceFilter, studioFilter, timeFilter]);

  if (loading && movies.length === 0) {
    return (
      <div className="space-y-8">
        <div className="hero min-h-[40vh] bg-base-200 rounded-2xl animate-pulse">
          <div className="hero-content text-center">
            <div className="space-y-4">
              <div className="h-12 w-72 bg-base-300 rounded mx-auto" />
              <div className="h-5 w-96 bg-base-300 rounded mx-auto" />
              <div className="h-14 w-80 bg-base-300 rounded mx-auto mt-4" />
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
      </div>
    );
  }

  if (error && movies.length === 0) {
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

  if (!moviesData.total && !loading) {
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

            <div className="max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {isSearching ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-6 h-6 opacity-50 animate-spin"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
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
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Search movies, genres, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered input-lg w-full pl-12 pr-12 text-lg focus:input-primary shadow-lg"
                />
                {searchQuery && !isSearching && (
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
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <span className="loading loading-spinner loading-sm text-primary" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm opacity-60">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>
                {moviesData.total} movie{moviesData.total !== 1 ? "s" : ""}{" "}
                available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections - Hidden when searching */}
      {!sectionsLoading && sections && !debouncedSearchQuery.trim() && (
        <div className="space-y-6">
          <ContentSection
            title="Now Popular"
            icon="🔥"
            movies={sections.popular}
            loading={false}
            searchQuery={debouncedSearchQuery}
            sectionType="popular"
          />
          <ContentSection
            title="Trending This Week"
            icon="📈"
            movies={sections.trending}
            loading={false}
            searchQuery={debouncedSearchQuery}
            sectionType="trending"
          />
          <ContentSection
            title="Coming Soon"
            icon="🎟️"
            movies={sections.comingSoon}
            loading={false}
            searchQuery={debouncedSearchQuery}
            sectionType="coming-soon"
          />
          <ContentSection
            title="Newest Additions"
            icon="✨"
            movies={sections.newest}
            loading={false}
            searchQuery={debouncedSearchQuery}
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {hasActiveFilters ? "Search Results" : "Browse All"}
            </h2>
            <span className="badge badge-soft badge-sm">
              {movies.length} {movies.length === 1 ? "title" : "titles"}
              {hasActiveFilters && ` of ${moviesData.total}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-sm gap-2 ${showFilters ? "btn-primary" : "btn-ghost"}`}
            >
              Filters
              {activeFilterLabels.length > 0 && (
                <span className="badge badge-sm badge-primary">
                  {activeFilterLabels.length}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn btn-ghost btn-sm gap-1.5 text-sm opacity-60 hover:opacity-100"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {activeFilterLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilterLabels.map((filter) => (
              <ActiveFilterBadge
                key={filter.key}
                label={filter.label}
                onClear={() => {
                  if (filter.key === "duration") setDurationFilter("all");
                  if (filter.key === "price") setPriceFilter("all");
                  if (filter.key === "studio") setStudioFilter("all");
                  if (filter.key === "time") setTimeFilter("all");
                }}
              />
            ))}
          </div>
        )}

        {showFilters && (
          <div className="card bg-base-200 shadow-sm mb-6">
            <div className="card-body p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        {movies.length === 0 && !loading ? (
          <div className="hero min-h-[40vh]">
            <div className="hero-content text-center">
              <div className="max-w-md space-y-4">
                <div className="text-6xl">🔍</div>
                <h2 className="text-xl font-bold">No movies found</h2>
                <p className="opacity-60">
                  {debouncedSearchQuery.trim()
                    ? `No results for "${debouncedSearchQuery}" with the current filters.`
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {movies.map((movie, index) => {
                const firstSchedule = movie.schedules?.[0];
                const genre = movie.genre;
                const genreColor = getGenreColor(genre);
                const minPrice =
                  movie.schedules?.length > 0
                    ? Math.min(...movie.schedules.map((s) => s.price))
                    : null;
                const uniqueStudios = [
                  ...new Set(movie.schedules?.map((s) => s.studio) || []),
                ];

                return (
                  <div
                    key={movie.id}
                    className="card bg-base-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                  >
                    <MoviePoster movie={movie} index={index} />
                    <div className="card-body p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {genre && (
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`badge ${genreColor} badge-xs`}>
                                <HighlightText
                                  text={genre}
                                  query={searchQuery}
                                />
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

                      <div className="flex items-center gap-2 mt-3">
                        {movie.rating && (
                          <span className="badge badge-warning badge-sm gap-1 font-bold">
                            ★ {movie.rating.toFixed(1)}
                          </span>
                        )}
                        {minPrice && (
                          <span className="badge badge-success badge-sm font-bold">
                            {formatPrice(minPrice)}
                          </span>
                        )}
                      </div>

                      {uniqueStudios.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs opacity-60">
                            {uniqueStudios.slice(0, 2).join(", ")}
                            {uniqueStudios.length > 2 &&
                              ` +${uniqueStudios.length - 2}`}
                          </span>
                        </div>
                      )}

                      {movie.description && (
                        <p className="text-sm opacity-60 leading-relaxed mt-2 line-clamp-2">
                          <HighlightText
                            text={movie.description}
                            query={searchQuery}
                          />
                        </p>
                      )}

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
                                  {formatDateTime(schedule.showTime)}
                                </Link>
                              ))}
                              {movie.schedules.length > 3 && (
                                <span className="text-xs opacity-50 self-center">
                                  +{movie.schedules.length - 3} more
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-xs opacity-40">
                            No schedules available yet
                          </div>
                        )}

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

            <Pagination
              currentPage={currentPage}
              totalPages={moviesData.totalPages}
              totalItems={moviesData.total}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </>
        )}
      </section>
    </div>
  );
}
