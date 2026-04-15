# ⚡ TaskFlow

A production-ready full-stack task management application built with Node.js, React, and PostgreSQL.

---

## Overview

TaskFlow lets teams create projects, manage tasks, assign work, and track progress through a clean and intuitive UI. It was built as a demonstration of full-stack engineering — covering API design, authentication, state management, and containerised deployment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL 15 |
| **Auth** | JWT + bcrypt |
| **Frontend** | React 19, TypeScript, Vite |
| **State** | Zustand |
| **HTTP Client** | Axios |
| **Container** | Docker + Docker Compose |

---

## Architecture Decisions

### Language: Node.js over Go
The assignment suggests Go as the preferred backend language. Node.js was chosen instead because it is the language I can write most clearly and confidently within the time constraint — and the assignment explicitly permits this with the instruction to "note your choice in the README." The architecture (REST controllers, Prisma ORM, JWT middleware) maps 1:1 to what a Go implementation would look like using chi/gin + sqlc/pgx.

### Why Node.js + Express?
Express is minimal, unopinionated, and fast to set up — ideal for an interview-sized project where clarity matters more than convention. It keeps controllers readable and avoids magic.

### Why Prisma?
Prisma gives type-safe database access with an excellent DX. The schema-first approach means the data model is the single source of truth, and migrations (`prisma migrate deploy`) run automatically on container start. Both `up` (migration.sql) and `down` (down.sql) migration files are included in every migration folder.

### Why Zustand?
Zustand is the right size for this project. Redux would be overengineering — Zustand gives global state, actions, and selectors in under 30 lines per store. No boilerplate, no context wiring.

### UI: Custom CSS, no component library
Rather than pulling in shadcn/ui, Chakra, or MUI, the frontend uses hand-written CSS. This was a deliberate tradeoff: it reduces bundle size, avoids version-pinning complexity, and demonstrates understanding of layout and responsive design fundamentals. The decision is a tradeoff — a component library would accelerate future feature work.

### Tradeoffs Made
- **No file uploads / avatars** — out of scope
- **`prisma migrate deploy`** in Docker — production-safe command; `migrate dev` is for local schema iteration only
- **Structured JSON logging** — logs emit newline-delimited JSON (`{"level":"info","method":"GET",...}`) instead of using a dedicated logger like pino/winston, which would be the next step
- **Custom CSS over component library** — reduces bundle size and avoids version-pinning complexity; tradeoff is more CSS to maintain

---

## Running Locally

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/hariharan0033/taskflow-hariharan.git
cd taskflow-hariharan

# 2. Copy environment file
cp .env.example .env

# 3. Start everything
docker-compose up --build
# (If your Docker CLI is v20.10+ you can also use: docker compose up --build)
```

That's it. Docker will:
1. Start **PostgreSQL** and wait until it's healthy
2. Run **Prisma migrations** automatically
3. Start the **Express backend** on port `3000`
4. Build and serve the **React frontend** on port `5173`

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Health check | http://localhost:3000/health |

---

## Database Migrations

Migrations run **automatically** when the backend container starts via:

```bash
npx prisma migrate deploy
```

This applies all pending migrations from `backend/prisma/migrations/` without any manual steps.

Every migration includes both directions:

| File | Purpose |
|---|---|
| `migration.sql` | **Up** — creates tables, enums, indexes, foreign keys |
| `down.sql` | **Down** — drops all constraints, tables, and enums in reverse order |

To roll back manually:
```bash
# Connect to the running postgres container and execute down.sql
docker exec -i taskflow-hariharan-postgres-1 psql -U postgres -d taskflow < backend/prisma/migrations/20240101000000_init/down.sql
```

To create a new migration during development:

```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

---

## Seed Data

To load test data (a user + project + 3 tasks):

```bash
cd backend
npx prisma db seed
```

### Test Credentials

| Field | Value |
|---|---|
| Email | `test@example.com` |
| Password | `password123` |

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT |

### Projects
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/projects` | ✅ | List projects (owned or assigned), paginated with `?page=&limit=` |
| `POST` | `/projects` | ✅ | Create a project |
| `GET` | `/projects/:id` | ✅ | Get project + tasks |
| `PATCH` | `/projects/:id` | ✅ | Update project (owner only) |
| `DELETE` | `/projects/:id` | ✅ | Delete project (owner only) |
| `GET` | `/projects/:id/stats` | ✅ | Task counts by status and assignee |

### Tasks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/projects/:id/tasks` | ✅ | List tasks — filter by `?status=` `?assignee=`, paginated with `?page=&limit=` |
| `POST` | `/projects/:id/tasks` | ✅ | Create a task |
| `PATCH` | `/tasks/:id` | ✅ | Update task fields |
| `DELETE` | `/tasks/:id` | ✅ | Delete task (project owner or task creator only) |

### System
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |

### Error Format

```json
{ "error": "validation failed", "fields": { "email": "Valid email is required" } }
```

HTTP status codes: `400` validation · `401` unauthenticated · `403` forbidden · `404` not found

---

## Project Structure

```
taskflow-hariharan/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Data models
│   │   ├── seed.js             # Test data seed
│   │   └── migrations/         # SQL migration files
│   ├── src/
│   │   ├── app.js              # Express app + middleware
│   │   ├── server.js           # Entry point
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # JWT auth
│   │   ├── routes/             # Route definitions
│   │   └── utils/              # Prisma client, JWT helpers
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios instance + API calls
│   │   ├── store/              # Zustand state stores
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level pages
│   │   └── types.ts            # Shared TypeScript interfaces
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Bonus Features Implemented

- **Pagination** — `?page=&limit=` on `GET /projects` and `GET /projects/:id/tasks`
- **GET /projects/:id/stats** — task counts broken down by status and by assignee
- **Drag-and-drop Kanban board** — powered by `@dnd-kit`; drag tasks between columns to change status (optimistic update, reverts on error) or reorder within a column
- **Dark mode** — toggle in the navbar, persists via `localStorage` with no flash on load

---

## What I'd Do With More Time

- **Integration tests** — Jest + Supertest for auth and task endpoints (register, create task, delete as non-owner)
- **Real-time updates** — WebSocket or SSE so task changes appear live for all collaborators
- **Role-based access** — project member roles (viewer / editor / admin)
- **DB indexes** — explicit indexes on `Task.project_id` and `Task.assignee_id` for query performance at scale
- **Refresh tokens** — current JWT is 24h with no rotation; a proper refresh token flow would be more production-safe
- **Due date alerts** — highlight overdue tasks visually and optionally send email reminders
