import { describe, it, expect } from "vitest";

// Extract the logic from Home.jsx for testing
function getDurationCategory(minutes) {
  if (minutes < 90) return "short";
  if (minutes <= 150) return "medium";
  return "long";
}

function processMovies(movies, searchQuery, sortBy, durationFilter) {
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

  // 3. Sort
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
    default:
      break;
  }

  return result;
}

const mockMovies = [
  {
    id: 1,
    title: "The Matrix",
    description: "A hacker discovers reality is a simulation",
    genre: "Sci-Fi",
    duration: 136,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: 2,
    title: "Inception",
    description: "A thief enters dreams to steal secrets",
    genre: "Sci-Fi",
    duration: 148,
    createdAt: "2024-02-20T00:00:00Z",
  },
  {
    id: 3,
    title: "Toy Story",
    description: "Toys come to life when humans are away",
    genre: "Animation",
    duration: 81,
    createdAt: "2024-03-10T00:00:00Z",
  },
  {
    id: 4,
    title: "The Godfather",
    description: "A crime dynasty's story",
    genre: "Drama",
    duration: 175,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    title: "Finding Nemo",
    description: "A fish searches for his son",
    genre: "Animation",
    duration: 100,
    createdAt: "2024-04-05T00:00:00Z",
  },
];

describe("getDurationCategory", () => {
  it("returns 'short' for movies under 90 minutes", () => {
    expect(getDurationCategory(89)).toBe("short");
    expect(getDurationCategory(60)).toBe("short");
    expect(getDurationCategory(1)).toBe("short");
  });

  it("returns 'medium' for movies 90-150 minutes", () => {
    expect(getDurationCategory(90)).toBe("medium");
    expect(getDurationCategory(120)).toBe("medium");
    expect(getDurationCategory(150)).toBe("medium");
  });

  it("returns 'long' for movies over 150 minutes", () => {
    expect(getDurationCategory(151)).toBe("long");
    expect(getDurationCategory(180)).toBe("long");
    expect(getDurationCategory(200)).toBe("long");
  });
});

describe("Search filter", () => {
  it("filters by title", () => {
    const result = processMovies(mockMovies, "Matrix", "default", "all");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("The Matrix");
  });

  it("filters by description", () => {
    const result = processMovies(mockMovies, "dreams", "default", "all");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Inception");
  });

  it("filters by genre", () => {
    const result = processMovies(mockMovies, "Animation", "default", "all");
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.title)).toContain("Toy Story");
    expect(result.map((m) => m.title)).toContain("Finding Nemo");
  });

  it("is case insensitive", () => {
    const result = processMovies(mockMovies, "MATRIX", "default", "all");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("The Matrix");
  });

  it("returns all movies when search is empty", () => {
    const result = processMovies(mockMovies, "", "default", "all");
    expect(result).toHaveLength(5);
  });

  it("returns no movies when no match", () => {
    const result = processMovies(mockMovies, "xyz123", "default", "all");
    expect(result).toHaveLength(0);
  });

  it("handles partial matches", () => {
    const result = processMovies(mockMovies, "find", "default", "all");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Finding Nemo");
  });
});

describe("Duration filter", () => {
  it("filters short movies", () => {
    const result = processMovies(mockMovies, "", "default", "short");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Toy Story");
  });

  it("filters medium movies", () => {
    const result = processMovies(mockMovies, "", "default", "medium");
    expect(result).toHaveLength(3);
    expect(result.map((m) => m.title)).toContain("The Matrix");
    expect(result.map((m) => m.title)).toContain("Inception");
    expect(result.map((m) => m.title)).toContain("Finding Nemo");
  });

  it("filters long movies", () => {
    const result = processMovies(mockMovies, "", "default", "long");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("The Godfather");
  });

  it("returns all movies when filter is 'all'", () => {
    const result = processMovies(mockMovies, "", "default", "all");
    expect(result).toHaveLength(5);
  });
});

describe("Sort", () => {
  it("sorts by title ascending", () => {
    const result = processMovies(mockMovies, "", "title-asc", "all");
    expect(result[0].title).toBe("Finding Nemo");
    expect(result[4].title).toBe("Toy Story");
  });

  it("sorts by title descending", () => {
    const result = processMovies(mockMovies, "", "title-desc", "all");
    expect(result[0].title).toBe("Toy Story");
    expect(result[4].title).toBe("Finding Nemo");
  });

  it("sorts by duration ascending", () => {
    const result = processMovies(mockMovies, "", "duration-asc", "all");
    expect(result[0].duration).toBe(81);
    expect(result[4].duration).toBe(175);
  });

  it("sorts by duration descending", () => {
    const result = processMovies(mockMovies, "", "duration-desc", "all");
    expect(result[0].duration).toBe(175);
    expect(result[4].duration).toBe(81);
  });

  it("sorts by newest first", () => {
    const result = processMovies(mockMovies, "", "newest", "all");
    expect(result[0].title).toBe("Finding Nemo");
    expect(result[4].title).toBe("The Godfather");
  });

  it("maintains default order", () => {
    const result = processMovies(mockMovies, "", "default", "all");
    expect(result[0].id).toBe(1);
    expect(result[4].id).toBe(5);
  });
});

describe("Combined filters", () => {
  it("applies search and duration filter together", () => {
    const result = processMovies(mockMovies, "a", "default", "medium");
    expect(
      result.every((m) => getDurationCategory(m.duration) === "medium"),
    ).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("applies search, filter, and sort together", () => {
    const result = processMovies(mockMovies, "", "title-asc", "medium");
    expect(result).toHaveLength(3);
    expect(result[0].title).toBe("Finding Nemo");
  });
});
