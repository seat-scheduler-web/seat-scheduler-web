# Seat Scheduler Web

A full-stack seat scheduling app for movie showtimes and bookings.

This repository is organized as a small monorepo with a React/Vite frontend, an Express backend, and a Prisma schema for the booking data model.

## Status

Early development.

Current backend behavior:

- Starts an Express server.
- Enables CORS and JSON request bodies.
- Exposes `GET /` as a health check.
- Exposes `GET /health/db` to test the database connection.
- Exposes movie CRUD endpoints with nested schedule data.

Current data model:

- Users
- Movies
- Schedules
- Bookings

Update this section whenever a major feature lands so the README stays honest.

## Tech Stack

| Area        | Tools            |
| ----------- | ---------------- |
| Frontend    | React, Vite      |
| Backend     | Node.js, Express |
| Database    | MySQL or MariaDB |
| ORM         | Prisma           |
| Development | Nodemon, ESLint  |

## Project Structure

```text
seat-scheduler-web/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   └── movieController.js
│   │   ├── lib/
│   │   │   └── prisma.js
│   │   ├── models/
│   │   │   └── movieModel.js
│   │   ├── routes/
│   │   │   └── movieRoutes.js
│   │   └── app.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── LICENSE
└── README.md
```

When new folders become important, add them here with one-line descriptions.

## Prerequisites

- Node.js 18 or newer
- npm
- MySQL or MariaDB

## Environment Variables

Create `backend/.env` from the example file:

```bash
cd backend
cp .env.example .env
```

Available backend variables:

```env
PORT=3000

DATABASE_URL="mysql://username:password@localhost:3306/seat-scheduler"
DATABASE_USER="username"
DATABASE_PASSWORD="password"
DATABASE_NAME="seat-scheduler"
DATABASE_HOST="localhost"
DATABASE_PORT=3306
```

Keep `.env.example` updated whenever configuration changes.

## Installation

Install dependencies for each workspace:

```bash
npm install
cd backend
npm install
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

Core models:

| Model      | Purpose                                      |
| ---------- | -------------------------------------------- |
| `User`     | Stores account credentials and owns bookings |
| `Movie`    | Stores movie metadata                        |
| `Schedule` | Stores a movie showtime and studio           |
| `Booking`  | Connects a user, schedule, and seat number   |

Useful Prisma commands, run from `backend/`:

```bash
npx prisma migrate dev
npx prisma generate
```

## Scripts

Root:

| Command       | Description                |
| ------------- | -------------------------- |
| `npm install` | Installs root dependencies |

Backend:

| Command       | Description                            |
| ------------- | -------------------------------------- |
| `npm run dev` | Starts the Express server with Nodemon |
| `npm test`    | Placeholder test script                |

Frontend:

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Starts the Vite development server  |
| `npm run build`   | Builds the frontend for production  |
| `npm run preview` | Serves the production build locally |
| `npm run lint`    | Runs ESLint                         |

## API

Base URL in development:

```text
http://localhost:3000
```

| Method | Endpoint | Description                                |
| ------ | -------- | ------------------------------------------ |
| `GET`  | `/`      | Health check. Returns `Server is running`. |
| `GET`  | `/health/db` | Tests the database connection. |
| `GET`  | `/api/movies` | Lists movies with schedules. |
| `GET`  | `/api/movies/:id` | Gets one movie with schedules. |
| `POST` | `/api/movies` | Creates a movie with optional schedules. |
| `PATCH` | `/api/movies/:id` | Updates a movie and optionally replaces schedules. |
| `DELETE` | `/api/movies/:id` | Deletes a movie and its schedules. |

## README Maintenance

This README is meant to be easy to keep current. When the project changes, check these sections:

- Add new setup requirements to [Prerequisites](#prerequisites).
- Add or remove variables in [Environment Variables](#environment-variables).
- Add new commands to [Scripts](#scripts).
- Add new routes to [API](#api).
- Update [Project Structure](#project-structure) only for folders people need to know about.
- Update [Status](#status) when a feature becomes usable.

## License

This project is licensed under the terms in [LICENSE](./LICENSE).
