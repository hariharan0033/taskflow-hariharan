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

### Why Node.js + Express?
Express is minimal, unopinionated, and fast to set up — ideal for an interview-sized project where clarity matters more than convention. It keeps controllers readable and avoids magic.

### Why Prisma?
Prisma gives type-safe database access with an excellent DX. The schema-first approach means the data model is the single source of truth, and auto-generated migrations keep the DB in sync reliably.

### Why Zustand?
Zustand is the right size for this project. Redux would be overengineering — Zustand gives global state, actions, and selectors in under 30 lines per store. No boilerplate, no context wiring.

### Tradeoffs Made
- **No pagination** — kept queries simple; easy to add with Prisma's `skip`/`take`
- **No file uploads / avatars** — out of scope
- **`prisma migrate deploy`** instead of `migrate dev` in Docker — deploy is the production-safe command; dev is for local schema changes only
- **CSS instead of a UI library** — keeps the bundle lean and shows CSS fundamentals

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
docker compose up --build
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
| `GET` | `/projects` | ✅ | List projects (owned or assigned) |
| `POST` | `/projects` | ✅ | Create a project |
| `GET` | `/projects/:id` | ✅ | Get project + tasks |
| `PATCH` | `/projects/:id` | ✅ | Update project (owner only) |
| `DELETE` | `/projects/:id` | ✅ | Delete project (owner only) |
| `GET` | `/projects/:id/stats` | ✅ | Task counts by status and assignee |

### Tasks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/projects/:id/tasks` | ✅ | List tasks (filter by `?status=` `?assignee=`) |
| `POST` | `/projects/:id/tasks` | ✅ | Create a task |
| `PATCH` | `/tasks/:id` | ✅ | Update task fields |
| `DELETE` | `/tasks/:id` | ✅ | Delete task (project owner only) |

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

## What I'd Do With More Time

- **Pagination** — `skip`/`take` on task and project queries for large datasets
- **Drag & drop** — reorder tasks by priority using `@dnd-kit`
- **Real-time updates** — WebSocket or Server-Sent Events so task changes appear live for all team members
- **Role-based access** — project member roles (viewer / editor / admin)
- **Due date alerts** — highlight overdue tasks and send email reminders
- **Test suite** — Jest + Supertest for backend, React Testing Library for frontend
