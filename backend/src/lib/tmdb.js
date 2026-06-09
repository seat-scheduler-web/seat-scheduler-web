const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL =
  process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL =
  process.env.TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p";

/**
 * Search for a movie by title
 */
async function searchMovie(title) {
  if (!TMDB_API_KEY) {
    return null;
  }

  try {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=en-US&page=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0]; // Return first result
    }
    return null;
  } catch (error) {
    console.error(`Error searching for movie "${title}":`, error.message);
    return null;
  }
}

/**
 * Get movie details by TMDB ID
 */
async function getMovieDetails(tmdbId) {
  if (!TMDB_API_KEY) {
    return null;
  }

  try {
    const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching movie details for ID ${tmdbId}:`,
      error.message,
    );
    return null;
  }
}

/**
 * Get full poster URL from poster path
 */
function getPosterUrl(posterPath, size = "w500") {
  if (!posterPath) {
    return null;
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
}

/**
 * Get backdrop URL from backdrop path
 */
function getBackdropUrl(backdropPath, size = "w780") {
  if (!backdropPath) {
    return null;
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`;
}

/**
 * Enrich movie data with TMDB information
 */
async function enrichMovieData(movieData) {
  if (!TMDB_API_KEY) {
    return movieData;
  }

  try {
    const tmdbMovie = await searchMovie(movieData.title);

    if (tmdbMovie) {
      return {
        ...movieData,
        posterUrl: getPosterUrl(tmdbMovie.poster_path) || movieData.posterUrl,
        rating: tmdbMovie.vote_average || movieData.rating,
        description: tmdbMovie.overview || movieData.description,
      };
    }
  } catch (error) {
    console.error(`Error enriching movie "${movieData.title}":`, error.message);
  }

  return movieData;
}

export {
  enrichMovieData,
  getBackdropUrl,
  getMovieDetails,
  getPosterUrl,
  searchMovie,
};
