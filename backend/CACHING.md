# Caching Strategy

## Overview

The backend uses a simple in-memory cache to reduce database queries for frequently accessed data. Cache entries have a TTL (Time To Live) and are automatically invalidated when related data changes.

## Cache Library

**Location:** `src/lib/cache.js`

A lightweight in-memory cache with the following features:

- Key-value storage with TTL support
- Prefix-based invalidation (e.g., invalidate all `movies:*` keys)
- Cache stats for monitoring

### API

| Function                      | Description                                                   |
| ----------------------------- | ------------------------------------------------------------- |
| `get(key)`                    | Get cached value, returns `undefined` if not found or expired |
| `set(key, value, ttlSeconds)` | Store value with TTL (default: 60s)                           |
| `del(key)`                    | Delete specific cache key                                     |
| `invalidatePrefix(prefix)`    | Delete all keys starting with prefix                          |
| `clear()`                     | Clear entire cache                                            |
| `stats()`                     | Get cache size and keys                                       |

## Cached Endpoints

### Movies

| Endpoint                        | Cache Key         | TTL | Invalidation                 |
| ------------------------------- | ----------------- | --- | ---------------------------- |
| `GET /api/movies`               | `movies:list`     | 60s | Movie create/update/delete   |
| `GET /api/movies?view=sections` | `movies:sections` | 60s | Movie/Schedule create/delete |
| `GET /api/movies/:id`           | `movies:{id}`     | 60s | Movie update/delete          |

### Schedules

| Endpoint                       | Cache Key              | TTL | Invalidation           |
| ------------------------------ | ---------------------- | --- | ---------------------- |
| `GET /api/schedules`           | `schedules:list`       | 60s | Schedule create/delete |
| `GET /api/schedules/:id`       | `schedules:{id}`       | 60s | Schedule delete        |
| `GET /api/schedules/:id/seats` | `schedules:{id}:seats` | 15s | N/A (short TTL)        |

## Cache Invalidation

Cache is invalidated when data changes:

- **Movie created/updated/deleted** → `invalidatePrefix("movies:")`
- **Schedule created** → `invalidatePrefix("schedules:")` + `invalidatePrefix("movies:sections")`
- **Schedule deleted** → `invalidatePrefix("schedules:")` + `invalidatePrefix("movies:sections")`

## HTTP Cache Headers

All GET responses include `Cache-Control` header:

```
Cache-Control: public, max-age=60, stale-while-revalidate=30
```

This tells CDNs and browsers:

- Cache for 60 seconds
- Serve stale content for up to 30 seconds while revalidating

## Monitoring

### Check cache stats

```
GET /health/cache
```

Response:

```json
{
  "status": "ok",
  "cache": {
    "size": 3,
    "keys": ["movies:list", "movies:sections", "schedules:list"]
  }
}
```

### Clear cache (admin)

```
POST /api/admin/cache/clear
```

## Cache Hit/Miss Headers

Responses include `X-Cache` header:

- `X-Cache: HIT` — served from cache
- `X-Cache: MISS` — fetched from database

## Future Improvements

- Redis support for distributed caching
- Cache warming on startup
- Per-endpoint TTL configuration
- Cache size limits with LRU eviction
