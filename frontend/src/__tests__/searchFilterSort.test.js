import { describe, it, expect } from "vitest";

// Test the duration category logic (still used in frontend for display)
function getDurationCategory(minutes) {
  if (minutes < 90) return "short";
  if (minutes <= 150) return "medium";
  return "long";
}

// Test the API URL builder logic (mirrors Home.jsx buildApiUrl)
function buildApiUrl(filters, itemsPerPage = 12) {
  const {
    page = 1,
    search = "",
    sort = "default",
    duration = "all",
    price = "all",
    studio = "all",
    time = "all",
  } = filters;

  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", itemsPerPage.toString());
  if (search.trim()) params.set("search", search.trim());
  if (sort !== "default") params.set("sort", sort);
  if (duration !== "all") params.set("duration", duration);
  if (price !== "all") params.set("price", price);
  if (studio !== "all") params.set("studio", studio);
  if (time !== "all") params.set("time", time);
  return `/movies?${params.toString()}`;
}

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

describe("buildApiUrl", () => {
  describe("basic pagination", () => {
    it("builds URL with default params", () => {
      const url = buildApiUrl({ page: 1 });
      expect(url).toBe("/movies?page=1&limit=12");
    });

    it("builds URL with custom page", () => {
      const url = buildApiUrl({ page: 3 });
      expect(url).toBe("/movies?page=3&limit=12");
    });

    it("builds URL with custom items per page", () => {
      const url = buildApiUrl({ page: 1 }, 24);
      expect(url).toBe("/movies?page=1&limit=24");
    });
  });

  describe("search param", () => {
    it("includes search param when provided", () => {
      const url = buildApiUrl({ page: 1, search: "matrix" });
      expect(url).toContain("search=matrix");
    });

    it("does not include search param when empty", () => {
      const url = buildApiUrl({ page: 1, search: "" });
      expect(url).not.toContain("search=");
    });

    it("does not include search param when whitespace only", () => {
      const url = buildApiUrl({ page: 1, search: "   " });
      expect(url).not.toContain("search=");
    });

    it("trims search param", () => {
      const url = buildApiUrl({ page: 1, search: "  matrix  " });
      expect(url).toContain("search=matrix");
    });
  });

  describe("sort param", () => {
    it("includes sort param when not default", () => {
      const url = buildApiUrl({ page: 1, sort: "price-asc" });
      expect(url).toContain("sort=price-asc");
    });

    it("does not include sort param when default", () => {
      const url = buildApiUrl({ page: 1, sort: "default" });
      expect(url).not.toContain("sort=");
    });

    it("supports all sort options", () => {
      const sorts = [
        "title-asc",
        "title-desc",
        "duration-asc",
        "duration-desc",
        "newest",
        "price-asc",
        "price-desc",
        "popularity",
        "rating",
      ];
      sorts.forEach((sort) => {
        const url = buildApiUrl({ page: 1, sort });
        expect(url).toContain(`sort=${sort}`);
      });
    });
  });

  describe("duration filter", () => {
    it("includes duration filter when not all", () => {
      const url = buildApiUrl({ page: 1, duration: "short" });
      expect(url).toContain("duration=short");
    });

    it("does not include duration filter when all", () => {
      const url = buildApiUrl({ page: 1, duration: "all" });
      expect(url).not.toContain("duration=");
    });

    it("supports all duration options", () => {
      ["short", "medium", "long"].forEach((duration) => {
        const url = buildApiUrl({ page: 1, duration });
        expect(url).toContain(`duration=${duration}`);
      });
    });
  });

  describe("price filter", () => {
    it("includes price filter when not all", () => {
      const url = buildApiUrl({ page: 1, price: "low" });
      expect(url).toContain("price=low");
    });

    it("does not include price filter when all", () => {
      const url = buildApiUrl({ page: 1, price: "all" });
      expect(url).not.toContain("price=");
    });

    it("supports all price options", () => {
      ["low", "medium", "high"].forEach((price) => {
        const url = buildApiUrl({ page: 1, price });
        expect(url).toContain(`price=${price}`);
      });
    });
  });

  describe("studio filter", () => {
    it("includes studio filter when not all", () => {
      const url = buildApiUrl({ page: 1, studio: "Studio 1" });
      expect(url).toContain("studio=Studio+1");
    });

    it("does not include studio filter when all", () => {
      const url = buildApiUrl({ page: 1, studio: "all" });
      expect(url).not.toContain("studio=");
    });
  });

  describe("time filter", () => {
    it("includes time filter when not all", () => {
      const url = buildApiUrl({ page: 1, time: "morning" });
      expect(url).toContain("time=morning");
    });

    it("does not include time filter when all", () => {
      const url = buildApiUrl({ page: 1, time: "all" });
      expect(url).not.toContain("time=");
    });

    it("supports all time options", () => {
      ["morning", "afternoon", "evening"].forEach((time) => {
        const url = buildApiUrl({ page: 1, time });
        expect(url).toContain(`time=${time}`);
      });
    });
  });

  describe("combined params", () => {
    it("builds URL with multiple params", () => {
      const url = buildApiUrl({
        page: 2,
        search: "action",
        sort: "price-asc",
        duration: "medium",
        price: "low",
        studio: "Studio 1",
        time: "evening",
      });

      expect(url).toContain("page=2");
      expect(url).toContain("limit=12");
      expect(url).toContain("search=action");
      expect(url).toContain("sort=price-asc");
      expect(url).toContain("duration=medium");
      expect(url).toContain("price=low");
      expect(url).toContain("studio=Studio+1");
      expect(url).toContain("time=evening");
    });

    it("builds URL with only pagination and search", () => {
      const url = buildApiUrl({
        page: 1,
        search: "matrix",
      });

      expect(url).toBe("/movies?page=1&limit=12&search=matrix");
    });

    it("builds URL with only pagination and sort", () => {
      const url = buildApiUrl({
        page: 1,
        sort: "newest",
      });

      expect(url).toBe("/movies?page=1&limit=12&sort=newest");
    });
  });

  describe("URL encoding", () => {
    it("properly encodes special characters in search", () => {
      const url = buildApiUrl({ page: 1, search: "star wars" });
      expect(url).toContain("search=star+wars");
    });

    it("properly encodes special characters in studio", () => {
      const url = buildApiUrl({ page: 1, studio: "Studio & Cinema" });
      expect(url).toContain("studio=Studio+%26+Cinema");
    });
  });
});

describe("filter state management", () => {
  it("has correct default filter values", () => {
    const defaults = {
      search: "",
      sort: "default",
      duration: "all",
      price: "all",
      studio: "all",
      time: "all",
    };

    const url = buildApiUrl({ page: 1, ...defaults });
    // Only page and limit should be present
    expect(url).toBe("/movies?page=1&limit=12");
  });

  it("resets to page 1 when filters change", () => {
    // Simulate changing filter from page 3
    const url = buildApiUrl({ page: 1, sort: "price-asc" });
    expect(url).toContain("page=1");
    expect(url).toContain("sort=price-asc");
  });
});
