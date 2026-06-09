/**
 * Simple in-memory cache with TTL support.
 * Used for caching frequently accessed API responses.
 */

const cache = new Map();

/**
 * Get a cached value by key.
 * Returns undefined if not found or expired.
 */
function get(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }

  return entry.value;
}

/**
 * Set a cached value with TTL (default: 60 seconds).
 */
function set(key, value, ttlSeconds = 60) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete a specific cache key.
 */
function del(key) {
  cache.delete(key);
}

/**
 * Invalidate all cache keys matching a prefix.
 */
function invalidatePrefix(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear the entire cache.
 */
function clear() {
  cache.clear();
}

/**
 * Get cache stats for monitoring.
 */
function stats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

export { get, set, del, invalidatePrefix, clear, stats };
