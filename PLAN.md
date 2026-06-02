# Seat Scheduler Web — v3.0 Roadmap

**Deadline:** June 6th, 2026 (4 days)

---

## Day 1 (June 3): 🔒 Security & Reliability

### [bug] fix-jwt-secret-hardcoded-fallback

**description**
The JWT secret falls back to `"secret"` when `JWT_SECRET` env var is not set (both in `authMiddleware.js` and `userController.js`). This is a critical security vulnerability — anyone can forge tokens.

**checklist**

- [ ] Remove hardcoded fallback `"secret"` from `authMiddleware.js`
- [ ] Remove hardcoded fallback `"secret"` from `userController.js`
- [ ] Make JWT_SECRET required — throw error on startup if not set
- [ ] Update `.env.example` to note that JWT_SECRET is required

**labels**
bug, security, backend, critical

---

### [bug] fix-cors-allows-all-origins

**description**
The CORS middleware uses `cors()` with no configuration, allowing all origins. Should be restricted to the frontend domain in production.

**checklist**

- [ ] Configure CORS to allow specific origins
- [ ] Use `CORS_ORIGIN` env variable for allowed origins
- [ ] Default to allowing all origins only in development

**labels**
bug, security, backend

---

### [bug] fix-api-client-hardcoded-base-url

**description**
The API base URL in `frontend/src/api/client.js` is hardcoded to the production URL. Local development requires editing the source file.

**checklist**

- [ ] Use `VITE_API_BASE` env variable with `http://localhost:3000/api` fallback
- [ ] Create `frontend/.env.example` with `VITE_API_BASE`

**labels**
bug, frontend, dev-experience

---

### [bug] fix-missing-error-boundaries

**description**
No React error boundaries exist. Any component render error crashes the entire app with a blank screen.

**checklist**

- [ ] Create `ErrorBoundary` component with fallback UI
- [ ] Wrap each page route with `ErrorBoundary`
- [ ] Show user-friendly error message with "Go Home" button

**labels**
bug, frontend, reliability

---

## Day 2 (June 4): 🐛 Bug Fixes & Validation

### [bug] fix-booking-confirmation-state-loss-on-refresh

**description**
BookingConfirmation reads data from `location.state?.booking`. Refreshing the page loses the state and shows "No booking data".

**checklist**

- [ ] Extract booking ID from URL params (`/bookings/:id/confirmation`)
- [ ] Fetch booking from API on mount if not in location state
- [ ] Add loading state while fetching
- [ ] Handle 404 if booking doesn't exist

**labels**
bug, frontend, reliability

---

### [bug] fix-undo-pop-returns-stale-value

**description**
`popUndo` in `UndoStackContext.jsx` returns `action` from outer scope but the value is set inside `setQueues`. Due to React batching, rapid consecutive calls return stale values.

**checklist**

- [ ] Refactor `popUndo` to compute dequeued value before setting state
- [ ] Return the correct dequeued entry

**labels**
bug, frontend, data-integrity

---

### [bug] fix-queue-advance-returns-undefined

**description**
`advanceQueue` in `BuyerQueueContext.jsx` tries to return `dequeued` from inside `setQueues` callback. The return value is always `null` due to React state batching.

**checklist**

- [ ] Compute dequeued value before calling setQueues
- [ ] Return the correct dequeued entry

**labels**
bug, frontend

---

### [enhancement] add-environment-validation

**description**
The backend doesn't validate required env vars on startup. If `DATABASE_URL` or `JWT_SECRET` is missing, the app starts but fails on first request with a confusing error.

**checklist**

- [ ] Create `validateEnv.js` that checks required env vars on startup
- [ ] Throw clear error listing missing variables
- [ ] Validate DATABASE_URL format
- [ ] Validate JWT_SECRET minimum length (e.g., 32 chars)
- [ ] Call validation in `app.js` before starting server

**labels**
enhancement, backend, reliability

---

## Day 3 (June 5): 🧪 Testing & Quality

### [chore] add-backend-unit-tests

**description**
The backend has zero tests. Add unit tests for validation, models, and middleware.

**checklist**

- [ ] Set up Vitest in backend
- [ ] Add tests for `validation.js` (hasRequiredFields, isPositiveId, isNonEmptyString, isValidDate)
- [ ] Add tests for `userModel.js` (create, find by email, find by username)
- [ ] Add tests for auth middleware (valid token, expired token, missing token)
- [ ] Add tests for booking controller validation

**labels**
chore, testing, backend

---

### [chore] add-frontend-unit-tests

**description**
The frontend has zero tests. Add unit tests for contexts and utility components.

**checklist**

- [ ] Set up Vitest + React Testing Library in frontend
- [ ] Add tests for `BuyerQueueContext` (join, advance, FIFO order, duplicate prevention)
- [ ] Add tests for `UndoStackContext` (push, pop, LIFO order, max size cap)
- [ ] Add tests for `HighlightText` component
- [ ] Add tests for search/filter/sort logic in Home page

**labels**
chore, testing, frontend

---

### [bug] fix-form-validation-inconsistent

**description**
Form validation is inconsistent. Register has `minLength={6}` on password but Login doesn't. Backend checks password length but returns generic "Invalid credentials".

**checklist**

- [ ] Add consistent client-side validation to Login and Register forms
- [ ] Add email format validation on client side
- [ ] Add username format validation (alphanumeric, 3-20 chars)
- [ ] Show specific error messages per field

**labels**
bug, frontend, ux

---

## Day 4 (June 6): ✨ Features & Ship

### [feature] add-admin-dashboard

**description**
Admins (role=ADMIN) need a dedicated interface to manage movies, schedules, and view all bookings.

**checklist**

- [ ] Add admin dashboard route (`/admin`) with route protection
- [ ] Create admin layout with sidebar navigation
- [ ] Add movies management page (list with edit/delete, create form)
- [ ] Add schedules management page (list with delete, create form)
- [ ] Add bookings overview page (all users' bookings, filter by status)
- [ ] Protect all admin routes with `adminMiddleware`

**labels**
feature, frontend, backend, admin

---

### [feature] add-user-profile-page

**description**
Users should be able to view and edit their profile information.

**checklist**

- [ ] Create profile page at `/profile`
- [ ] Show current user info (username, email, role, member since)
- [ ] Add form to update username and email
- [ ] Add password change form (current + new password)
- [ ] Show booking statistics (total, upcoming, cancelled)

**labels**
feature, frontend, ux

---

### [docs] update-readme-with-current-state

**description**
The README is severely outdated and doesn't reflect the current project.

**checklist**

- [ ] Update project description to reflect movie booking app
- [ ] Update tech stack table (add Tailwind, DaisyUI, Prisma, etc.)
- [ ] Update project structure diagram
- [ ] Add comprehensive setup instructions (frontend + backend)
- [ ] Add environment variables documentation
- [ ] Add API endpoint documentation

**labels**
docs, chore

---

## Summary

| Day       | Date   | Issues | Focus                  |
| --------- | ------ | ------ | ---------------------- |
| Day 1     | June 3 | 4      | Security & Reliability |
| Day 2     | June 4 | 4      | Bug Fixes & Validation |
| Day 3     | June 5 | 3      | Testing & Quality      |
| Day 4     | June 6 | 3      | Features & Ship        |
| **Total** |        | **14** |                        |
