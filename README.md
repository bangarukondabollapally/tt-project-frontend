# Project Tracker Frontend (React)

This repository contains the Vite-powered React application for the mini project management system. Students can record software projects, update their details and status, filter them by status, and see their deadlines. It talks to the backend through the URL in `VITE_API_BASE_URL`.

All commands below run from the root of this repository.

## Prerequisites

- Node.js and npm
- The backend API running and reachable, for projects to load

## Environment variables

Create a local `.env` file from the example. It is gitignored, so it will not be committed.

```bash
cp .env.example .env
```

| Variable            | Purpose         | Local example           |
|---------------------|-----------------|-------------------------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8080` |

The value is built into the application, so set it before running `npm run build`.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev   # start dev server (http://localhost:5173 by default)
```

## Checks

```bash
npm run lint   # ESLint
npm test       # Vitest
```

## Production build

```bash
npm run build     # production build in dist/
npm run preview   # preview the production build locally
```

## Project structure

The code is under `src/`:

- `main.jsx` – entry point that mounts the app
- `App.jsx` – root component
- `api/` – HTTP calls to the backend
- `pages/` – the projects page
- `components/` – the project card and form
- `utils/` – statuses, date formatting, and form validation
