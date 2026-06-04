# Seat Scheduler Web

A full-stack movie booking application for scheduling showtimes and managing seat reservations.

This repository is organized as a monorepo with a React/Vite frontend, an Express backend, and a Prisma schema for the database.

## Status

Production-ready with the following features:

- User authentication (register, login, JWT-based sessions)
- Movie browsing with search, filter, and sort
- Seat selection and booking system
- User profile management
- Admin dashboard for managing movies, schedules, and bookings
- Responsive UI with Tailwind CSS and DaisyUI

## Tech Stack

| Area        | Tools                                                   |
| ----------- | ------------------------------------------------------- |
| Frontend    | React 19, Vite, React Router, Tailwind CSS 4, DaisyUI 5 |
| Backend     | Node.js, Express 5, Prisma ORM                          |
| Database    | MySQL / MariaDB                                         |
| Auth        | JWT (jsonwebtoken), bcrypt                              |
| Testing     | Vitest, React Testing Library                           |
| Development | Nodemon, ESLint                                         |

## Project Structure

```text
seat-scheduler-web/
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # Database migration files
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.js           # Seed data script
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   ├── adminController.js
│   │   │   ├── bookingController.js
│   │   │   ├── movieController.js
│   │   │   ├── scheduleController.js
│   │   │   └── userController.js
│   │   ├── lib/              # Shared utilities
│   │   │   ├── apiResponse.js
│   │   │   ├── jwt.js
│   │   │   ├── prisma.js
│   │   │   ├── validateEnv.js
│   │   │   └── validation.js
│   │   ├── middlewares/      # Express middlewares
│   │   │   └── authMiddleware.js
│   │   ├── models/           # Database access layer
│   │   │   ├── bookingModel.js
│   │   │   ├── movieModel.js
│   │   │   ├── scheduleModel.js
│   │   │   └── userModel.js
│   │   ├── routes/           # API route definitions
│   │   │   ├── adminRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── movieRoutes.js
│   │   │   ├── scheduleRoutes.js
│   │   │   └── userRoutes.js
│   │   └── app.js            # Express app entry point
│   ├── __tests__/            # Backend unit tests
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   │   └── client.js
│   │   ├── components/       # Reusable UI components
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PageTransition.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/          # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── BuyerQueueContext.jsx
│   │   │   └── UndoStackContext.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin dashboard pages
│   │   │   │   ├── Bookings.jsx
│   │   │   │   ├── Movies.jsx
│   │   │   │   └── Schedules.jsx
│   │   │   ├── BookingConfirmation.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ScheduleDetail.jsx
│   │   │   └── SeatSelection.jsx
│   │   ├── __tests__/        # Frontend unit tests
│   │   ├── App.jsx           # Main app component with routes
│   │   ├── index.css         # Global styles
│   │   └── main.jsx          # React entry point
│   ├── public/
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── LICENSE
├── PLAN.md                   # Development roadmap
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MySQL or MariaDB

## Environment Variables

### Backend (`backend/.env`)

Create `backend/.env` from the example file:

```bash
cd backend
cp .env.example .env
```

| Variable            | Required | Description                                                           |
| ------------------- | -------- | --------------------------------------------------------------------- |
| `PORT`              | No       | Server port (default: 3000)                                           |
| `JWT_SECRET`        | **Yes**  | Secret key for JWT tokens (min 32 characters)                         |
| `DATABASE_URL`      | **Yes**  | MySQL connection string (format: `mysql://user:pass@host:port/db`)    |
| `CORS_ORIGIN`       | No       | Comma-separated allowed origins. Leave empty to allow all (dev only). |
| `DATABASE_USER`     | No       | MySQL username                                                        |
| `DATABASE_PASSWORD` | No       | MySQL password                                                        |
| `DATABASE_NAME`     | No       | Database name                                                         |
| `DATABASE_HOST`     | No       | Database host (default: localhost)                                    |
| `DATABASE_PORT`     | No       | Database port (default: 3306)                                         |

### Frontend (`frontend/.env`)

Create `frontend/.env` from the example file:

```bash
cd frontend
cp .env.example .env
```

| Variable        | Required | Description                                                 |
| --------------- | -------- | ----------------------------------------------------------- |
| `VITE_API_BASE` | No       | Backend API base URL (default: `http://localhost:3000/api`) |

## Installation

Install dependencies for each workspace:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

The backend defaults to `http://localhost:3000`.

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Vite will print the local frontend URL, usually `http://localhost:5173`.

## Database

The Prisma schema lives at `backend/prisma/schema.prisma`.

### Core Models

| Model      | Purpose                                                                |
| ---------- | ---------------------------------------------------------------------- |
| `User`     | Stores account credentials (username, email, password, role)           |
| `Movie`    | Stores movie metadata (title, description, duration, genre, posterUrl) |
| `Schedule` | Stores a movie showtime and studio                                     |
| `Booking`  | Connects a user, schedule, and seat number with status                 |

### Useful Prisma Commands

Run from `backend/`:

```bash
# Run pending migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed the database
npm run seed
```

## Scripts

### Backend

| Command              | Description                            |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Starts the Express server with Nodemon |
| `npm start`          | Starts the Express server (production) |
| `npm test`           | Runs unit tests with Vitest            |
| `npm run test:watch` | Runs unit tests in watch mode          |
| `npm run seed`       | Seeds the database with initial data   |

### Frontend

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Starts the Vite development server  |
| `npm run build`      | Builds the frontend for production  |
| `npm run preview`    | Serves the production build locally |
| `npm run lint`       | Runs ESLint                         |
| `npm test`           | Runs unit tests with Vitest         |
| `npm run test:watch` | Runs unit tests in watch mode       |

## API

Base URL in development:

```text
http://localhost:3000
```

### Public Endpoints

| Method | Endpoint                   | Description                                  | Auth |
| ------ | -------------------------- | -------------------------------------------- | ---- |
| `GET`  | `/`                        | Health check                                 | No   |
| `GET`  | `/health/db`               | Database connection test                     | No   |
| `GET`  | `/api/movies`              | List all movies with schedules               | No   |
| `GET`  | `/api/movies/:id`          | Get a single movie                           | No   |
| `GET`  | `/api/schedules`           | List schedules (optional `?movieId=` filter) | No   |
| `GET`  | `/api/schedules/:id`       | Get a single schedule                        | No   |
| `GET`  | `/api/schedules/:id/seats` | Get seat availability for a schedule         | No   |
| `POST` | `/api/users/register`      | Register a new user                          | No   |
| `POST` | `/api/users/login`         | Login and get JWT token                      | No   |

### Authenticated Endpoints

| Method  | Endpoint                   | Description                  | Auth |
| ------- | -------------------------- | ---------------------------- | ---- |
| `GET`   | `/api/users/me`            | Get current user profile     | Yes  |
| `PATCH` | `/api/users/me`            | Update username and email    | Yes  |
| `PATCH` | `/api/users/me/password`   | Change password              | Yes  |
| `GET`   | `/api/bookings`            | List current user's bookings | Yes  |
| `GET`   | `/api/bookings/:id`        | Get a single booking         | Yes  |
| `POST`  | `/api/bookings`            | Create a new booking         | Yes  |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel a booking             | Yes  |

### Admin Endpoints

| Method   | Endpoint                   | Description                                    | Auth  |
| -------- | -------------------------- | ---------------------------------------------- | ----- |
| `POST`   | `/api/movies`              | Create a movie                                 | Admin |
| `PATCH`  | `/api/movies/:id`          | Update a movie                                 | Admin |
| `DELETE` | `/api/movies/:id`          | Delete a movie                                 | Admin |
| `POST`   | `/api/schedules`           | Create a schedule                              | Admin |
| `DELETE` | `/api/admin/schedules/:id` | Delete a schedule                              | Admin |
| `GET`    | `/api/admin/bookings`      | List all bookings (optional `?status=` filter) | Admin |

## User Roles

The application supports two user roles:

- **USER**: Can browse movies, book seats, view their bookings, and manage their profile
- **ADMIN**: Has all USER permissions plus access to the admin dashboard for managing movies, schedules, and viewing all bookings

## Testing

The project includes comprehensive unit tests:

- **Backend**: 56 tests covering validation, auth middleware, and booking controller
- **Frontend**: 60 tests covering contexts (BuyerQueue, UndoStack), components (HighlightText), and utility functions (search/filter/sort)

Run tests:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

The frontend is configured for GitHub Pages deployment:

```bash
cd frontend
npm run deploy
```

## License

This project is licensed under the terms in [LICENSE](./LICENSE).
