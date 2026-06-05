# Seat Scheduler Web — v3.0 Roadmap

**Deadline:** June 6th, 2026 (4 days)

---

## Day 1 (June 3): 🔒 Security & Reliability

### [bug] fix-jwt-secret-hardcoded-fallback

**description**
The JWT secret falls back to `"secret"` when `JWT_SECRET` env var is not set (both in `authMiddleware.js` and `userController.js`). This is a critical security vulnerability — anyone can forge tokens.

## checklist

- [x] Remove hardcoded fallback `"secret"` from `authMiddleware.js`
- [x] Remove hardcoded fallback `"secret"` from `userController.js`
- [x] Make JWT_SECRET required — throw error on startup if not set
- [x] Update `.env.example` to note that JWT_SECRET is required

## labels

bug, security, backend, critical

---

### [bug] fix-cors-allows-all-origins

**description**
The CORS middleware uses `cors()` with no configuration, allowing all origins. Should be restricted to the frontend domain in production.

## checklist

- [x] Configure CORS to allow specific origins
- [x] Use `CORS_ORIGIN` env variable for allowed origins
- [x] Default to allowing all origins only in development

## labels

bug, security, backend

---

### [bug] fix-api-client-hardcoded-base-url

**description**
The API base URL in `frontend/src/api/client.js` is hardcoded to the production URL. Local development requires editing the source file.

## checklist

- [x] Use `VITE_API_BASE` env variable with `http://localhost:3000/api` fallback
- [x] Create `frontend/.env.example` with `VITE_API_BASE`

## labels

bug, frontend, dev-experience

---

### [bug] fix-missing-error-boundaries

**description**
No React error boundaries exist. Any component render error crashes the entire app with a blank screen.

## checklist

- [x] Create `ErrorBoundary` component with fallback UI
- [x] Wrap each page route with `ErrorBoundary`
- [x] Show user-friendly error message with "Go Home" button

## labels

bug, frontend, reliability

---

## Day 2 (June 4): 🐛 Bug Fixes & Validation

### [bug] fix-booking-confirmation-state-loss-on-refresh

**description**
BookingConfirmation reads data from `location.state?.booking`. Refreshing the page loses the state and shows "No booking data".

## checklist

- [x] Extract booking ID from URL params (`/bookings/:id/confirmation`)
- [x] Fetch booking from API on mount if not in location state
- [x] Add loading state while fetching
- [x] Handle 404 if booking doesn't exist

## labels

bug, frontend, reliability

---

### [bug] fix-undo-pop-returns-stale-value

**description**
`popUndo` in `UndoStackContext.jsx` returns `action` from outer scope but the value is set inside `setQueues`. Due to React batching, rapid consecutive calls return stale values.

## checklist

- [x] Refactor `popUndo` to compute dequeued value before setting state
- [x] Return the correct dequeued entry

## labels

bug, frontend, data-integrity

---

### [bug] fix-queue-advance-returns-undefined

**description**
`advanceQueue` in `BuyerQueueContext.jsx` tries to return `dequeued` from inside `setQueues` callback. The return value is always `null` due to React state batching.

## checklist

- [x] Compute dequeued value before calling setQueues
- [x] Return the correct dequeued entry

## labels

bug, frontend

---

### [enhancement] add-environment-validation

**description**
The backend doesn't validate required env vars on startup. If `DATABASE_URL` or `JWT_SECRET` is missing, the app starts but fails on first request with a confusing error.

## checklist

- [x] Create `validateEnv.js` that checks required env vars on startup
- [x] Throw clear error listing missing variables
- [x] Validate DATABASE_URL format
- [x] Validate JWT_SECRET minimum length (e.g., 32 chars)
- [x] Call validation in `app.js` before starting server

## labels

enhancement, backend, reliability

---

## Day 3 (June 5): 🧪 Testing & Quality

### [chore] add-backend-unit-tests

**description**
The backend has zero tests. Add unit tests for validation, models, and middleware.

## checklist

- [x] Set up Vitest in backend
- [x] Add tests for `validation.js` (hasRequiredFields, isPositiveId, isNonEmptyString, isValidDate)
- [x] Add tests for `userModel.js` (create, find by email, find by username)
- [x] Add tests for auth middleware (valid token, expired token, missing token)
- [x] Add tests for booking controller validation

## labels

chore, testing, backend

---

### [chore] add-frontend-unit-tests

**description**
The frontend has zero tests. Add unit tests for contexts and utility components.

## checklist

- [x] Set up Vitest + React Testing Library in frontend
- [x] Add tests for `BuyerQueueContext` (join, advance, FIFO order, duplicate prevention)
- [x] Add tests for `UndoStackContext` (push, pop, LIFO order, max size cap)
- [x] Add tests for `HighlightText` component
- [x] Add tests for search/filter/sort logic in Home page

## labels

chore, testing, frontend

---

### [bug] fix-form-validation-inconsistent

**description**
Form validation is inconsistent. Register has `minLength={6}` on password but Login doesn't. Backend checks password length but returns generic "Invalid credentials".

## checklist

- [x] Add consistent client-side validation to Login and Register forms
- [x] Add email format validation on client side
- [x] Add username format validation (alphanumeric, 3-20 chars)
- [x] Show specific error messages per field

## labels

bug, frontend, ux

---

## Day 4 (June 6): ✨ Features & Ship

### [feature] add-admin-dashboard

**description**
Admins (role=ADMIN) need a dedicated interface to manage movies, schedules, and view all bookings.

## checklist

- [x] Add admin dashboard route (`/admin`) with route protection
- [x] Create admin layout with sidebar navigation
- [x] Add movies management page (list with edit/delete, create form)
- [x] Add schedules management page (list with delete, create form)
- [x] Add bookings overview page (all users' bookings, filter by status)
- [x] Protect all admin routes with `adminMiddleware`

## labels

feature, frontend, backend, admin

---

### [feature] add-user-profile-page

**description**
Users should be able to view and edit their profile information.

## checklist

- [x] Create profile page at `/profile`
- [x] Show current user info (username, email, role, member since)
- [x] Add form to update username and email
- [x] Add password change form (current + new password)
- [x] Show booking statistics (total, upcoming, cancelled)

## labels

feature, frontend, ux

---

### [docs] update-readme-with-current-state

**description**
The README is severely outdated and doesn't reflect the current project.

## checklist

- [x] Update project description to reflect movie booking app
- [x] Update tech stack table (add Tailwind, DaisyUI, Prisma, etc.)
- [x] Update project structure diagram
- [x] Add comprehensive setup instructions (frontend + backend)
- [x] Add environment variables documentation
- [x] Add API endpoint documentation

## labels

docs, chore

---

## Day 5 (June 7): 🌱 Foundation - Seed Data & Quick UX Wins

### [chore] expand-seed-data

**description**
Add much more seed data to make the site feel alive. Include a LOT of movies, schedules, and bookings with every field filled.

## checklist

- [x] Add 50+ movies with complete data (title, description, duration, genre, posterUrl)
- [x] Add 100+ schedules with varied showtimes and studios
- [x] Add 200+ bookings with different statuses
- [x] Include diverse genres (Action, Comedy, Drama, Horror, Sci-Fi, Romance, etc.)
- [x] Add realistic movie descriptions
- [x] Add varied pricing across schedules
- [x] Create multiple admin users for testing
- [x] Document seed data structure in README

## labels

chore, data, content

---

### [ux] add-navigation-to-all-routes

**description**
Many routes are only accessible via URL (profile, admin, my-bookings). Add clear navigation links so users can access all features through the UI.

## checklist

- [x] Add profile link to navbar/dropdown menu
- [x] Add admin link for admin users
- [x] Add "My Bookings" link to navbar
- [x] Ensure all pages have clear navigation paths
- [x] Add breadcrumbs or back buttons where appropriate

## labels

ux, frontend, navigation

---

### [ux] add-toast-notifications

**description**
Users get no feedback when performing actions (booking, canceling, updating profile). Add toast notifications to confirm actions.

## checklist

- [x] Add toast notification for successful booking
- [x] Add toast notification for booking cancellation
- [x] Add toast notification for profile update
- [x] Add toast notification for password change
- [x] Add error toasts for failed actions
- [x] Ensure toasts auto-dismiss after reasonable time

## labels

ux, frontend, feedback

---

### [ux] add-loading-skeletons

**description**
Pages show blank content while loading. Add skeleton loaders to improve perceived performance.

## checklist

- [x] Add skeleton loader for movie list
- [x] Add skeleton loader for booking list
- [x] Add skeleton loader for admin tables
- [x] Ensure skeletons match final content layout

## labels

ux, frontend, performance

---

#113 [ux] add-empty-states

**description**
Lists show blank space when empty. Add helpful empty states with calls to action.

## checklist

- [x] Add empty state for movie list (no movies)
- [x] Add empty state for booking list (no bookings)
- [x] Add empty state for search results (no matches)
- [x] Include helpful messages and action buttons

## labels

ux, frontend

---

## Day 6 (June 8): 🎨 Content & Discovery

#114 [feature] add-content-sections

**description**
Add curated content sections like "Now Popular", "Newest", "Coming Soon" to make the site feel alive.

## checklist

- [ ] Add "Now Popular" section based on booking count
- [ ] Add "Newest" section based on movie creation date
- [ ] Add "Coming Soon" section for future schedules
- [ ] Add "Trending" section based on recent bookings
- [ ] Create visually distinct section layouts

## labels

feature, frontend, content

---

#115 [feature] expand-filters-and-sorts

**description**
Add more filter and sort options like price range, studio, seat availability, rating, etc.

## checklist

- [ ] Add price range filter
- [ ] Add studio filter
- [ ] Add seat availability filter
- [ ] Add sort by price (low to high, high to low)
- [ ] Add sort by popularity (most booked)
- [ ] Add sort by rating
- [ ] Add sort by distance (if location data exists)
- [ ] Add time of day filter (morning, afternoon, evening)

## labels

feature, frontend, ux

---

#116 [bug] fix-search-filter-ui

**description**
The search and filter UI has layout issues. Controls are not properly aligned and the mobile experience is poor.

## checklist

- [ ] Fix alignment of search input and filter dropdowns
- [ ] Improve mobile responsiveness of filter controls
- [ ] Add clear visual hierarchy between search and filters
- [ ] Ensure filter state is visually indicated when active

## labels

bug, frontend, ui

---

#117 [feature] add-seat-pricing

**description**
Add pricing to seat booking to make it feel realistic. Different seat types (regular, premium) should have different prices.

## checklist

- [ ] Add price field to schedule model
- [ ] Display price on seat selection page
- [ ] Calculate total price based on selected seats
- [ ] Show price breakdown in booking confirmation
- [ ] Add pricing tiers (e.g., regular vs premium seats)

## labels

feature, frontend, backend

---

## Day 7 (June 9): 🔍 Performance & Optimization

### [enhancement] add-debounce-to-search

**description**
Search triggers API call on every keystroke. Add debouncing to reduce API calls.

## checklist

- [ ] Add debounce to search input (300ms)
- [ ] Cancel pending requests on new input
- [ ] Show loading indicator during search

## labels

enhancement, frontend, performance

---

### [enhancement] optimize-frontend-bundle

**description**
The frontend bundle is not optimized. Add code splitting and lazy loading.

## checklist

- [ ] Add React.lazy for route-based code splitting
- [ ] Add Suspense boundaries with fallback
- [ ] Optimize image loading with lazy loading
- [ ] Analyze bundle size and remove unused dependencies

## labels

enhancement, frontend, performance

---

### [enhancement] add-api-response-caching

**description**
API responses are not cached, causing unnecessary database queries. Add caching for frequently accessed data.

## checklist

- [ ] Add in-memory caching for movie list
- [ ] Add cache invalidation on movie/schedule changes
- [ ] Add cache headers for API responses
- [ ] Document caching strategy

## labels

enhancement, backend, performance

---

### [enhancement] add-pagination

**description**
Lists load all items at once. Add pagination for better performance with large datasets.

## checklist

- [ ] Add pagination to movie list (backend)
- [ ] Add pagination to booking list (backend)
- [ ] Add pagination UI components (frontend)
- [ ] Add infinite scroll option for mobile

## labels

enhancement, frontend, backend

---

## Day 8 (June 10): 🛡️ Security Hardening

### [security] add-rate-limiting

**description**
API has no rate limiting, making it vulnerable to abuse. Add rate limiting to prevent brute force attacks.

## checklist

- [ ] Add rate limiting middleware to Express
- [ ] Configure different limits for auth vs API endpoints
- [ ] Add rate limit headers to responses
- [ ] Document rate limits in API docs

## labels

security, backend

---

### [security] add-input-sanitization

**description**
User inputs are not sanitized, potentially allowing XSS attacks. Add input sanitization.

## checklist

- [ ] Add input sanitization middleware
- [ ] Sanitize all user inputs before database operations
- [ ] Add Content Security Policy headers
- [ ] Test for XSS vulnerabilities

## labels

security, backend, frontend

---

### [security] add-csrf-protection

**description**
Forms have no CSRF protection. Add CSRF tokens to prevent cross-site request forgery.

## checklist

- [ ] Add CSRF middleware to Express
- [ ] Add CSRF tokens to all forms
- [ ] Verify CSRF tokens on form submission

## labels

security, backend

---

### [security] implement-https-redirect

**description**
The application doesn't enforce HTTPS in production. Add HTTPS redirect and security headers.

## checklist

- [ ] Add HTTPS redirect middleware
- [ ] Add HSTS header
- [ ] Add X-Frame-Options header
- [ ] Add X-Content-Type-Options header

## labels

security, backend

---

## Day 9 (June 11): 🚀 DevOps & CI/CD

### [chore] setup-github-actions-ci

**description**
Add CI/CD pipeline with GitHub Actions for automated testing and deployment.

## checklist

- [ ] Create GitHub Actions workflow for running tests on push/PR
- [ ] Add frontend build verification
- [ ] Add backend test execution
- [ ] Configure deployment to GitHub Pages on merge to main
- [ ] Add status badges to README

## labels

chore, devops, ci-cd

---

### [chore] add-docker-support

**description**
Add Docker configuration for easy local development and deployment.

## checklist

- [ ] Create Dockerfile for backend
- [ ] Create Dockerfile for frontend
- [ ] Create docker-compose.yml for full stack
- [ ] Add .dockerignore files
- [ ] Document Docker setup in README

## labels

chore, devops, docker

---

### [chore] add-health-check-endpoints

**description**
Add comprehensive health check endpoints for monitoring and deployment verification.

## checklist

- [ ] Add detailed health check endpoint with database status
- [ ] Add readiness probe endpoint
- [ ] Add liveness probe endpoint
- [ ] Document health check endpoints in API docs

## labels

chore, backend, monitoring

---

## Day 10 (June 12): 📊 Analytics & Monitoring

### [feature] add-analytics-tracking

**description**
No user behavior tracking exists. Add analytics to understand how users interact with the app.

## checklist

- [ ] Add page view tracking
- [ ] Track booking conversion funnel
- [ ] Track search queries
- [ ] Track error occurrences
- [ ] Create admin analytics dashboard

## labels

feature, analytics

---

### [feature] add-error-logging

**description**
Errors are only logged to console. Add proper error logging for production debugging.

## checklist

- [ ] Add structured error logging
- [ ] Add error context (user, request, timestamp)
- [ ] Create error log viewer in admin
- [ ] Add error notification for critical errors

## labels

feature, backend, monitoring

---

### [feature] add-activity-log

**description**
No audit trail exists. Add activity logging for important user actions.

## checklist

- [ ] Log user registration
- [ ] Log booking creation/cancellation
- [ ] Log profile changes
- [ ] Log admin actions
- [ ] Create activity log viewer in admin

## labels

feature, backend, admin

---

## Day 11 (June 13): 🎯 Final Polish & Launch

### [ux] add-keyboard-navigation

**description**
The app is not fully keyboard accessible. Add keyboard navigation support.

## checklist

- [ ] Add focus indicators to all interactive elements
- [ ] Implement keyboard navigation for seat selection
- [ ] Add keyboard shortcuts for common actions
- [ ] Test with screen reader

## labels

ux, accessibility

---

### [ux] add-dark-mode-toggle

**description**
Dark mode is theme-only. Add user toggle for dark/light mode.

## checklist

- [ ] Add dark mode toggle to navbar
- [ ] Persist theme preference in localStorage
- [ ] Ensure all components work in both themes
- [ ] Add smooth theme transition

## labels

ux, frontend

---

### [docs] add-api-documentation

**description**
API docs are in README only. Add interactive API documentation.

## checklist

- [ ] Add Swagger/OpenAPI spec
- [ ] Create interactive API docs page
- [ ] Add request/response examples
- [ ] Document authentication requirements

## labels

docs, api

---

### [docs] add-contributing-guide

**description**
No contribution guidelines exist. Add CONTRIBUTING.md for open source contributors.

## checklist

- [ ] Create CONTRIBUTING.md
- [ ] Document development setup
- [ ] Add code style guidelines
- [ ] Add PR review process
- [ ] Add issue templates

## labels

docs, community

---

### [chore] add-changelog

**description**
No changelog exists. Add CHANGELOG.md to track version history.

## checklist

- [ ] Create CHANGELOG.md
- [ ] Document all changes from v1.0 to v3.0
- [ ] Add versioning strategy
- [ ] Add release process documentation

## labels

docs, chore

---

### [chore] performance-benchmarking

**description**
No performance benchmarks exist. Add load testing and performance monitoring.

## checklist

- [ ] Add load testing scripts
- [ ] Benchmark API response times
- [ ] Identify and fix performance bottlenecks
- [ ] Document performance baselines

## labels

chore, performance

---

## Summary

| Day       | Date    | Issues | Focus                                  |
| --------- | ------- | ------ | -------------------------------------- |
| Day 1     | June 3  | 4      | Security & Reliability                 |
| Day 2     | June 4  | 4      | Bug Fixes & Validation                 |
| Day 3     | June 5  | 3      | Testing & Quality                      |
| Day 4     | June 6  | 3      | Features & Ship                        |
| Day 5     | June 7  | 5      | Foundation - Seed Data & Quick UX Wins |
| Day 6     | June 8  | 4      | Content & Discovery                    |
| Day 7     | June 9  | 4      | Performance & Optimization             |
| Day 8     | June 10 | 4      | Security Hardening                     |
| Day 9     | June 11 | 3      | DevOps & CI/CD                         |
| Day 10    | June 12 | 3      | Analytics & Monitoring                 |
| Day 11    | June 13 | 5      | Final Polish & Launch                  |
| **Total** |         | **42** |                                        |
