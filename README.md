# Resume Ecosystem

_Dynamic resume builder that keeps pace with every verified activity._

![Node.js](https://img.shields.io/badge/Node.js-20.x-73C619?logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white) ![Kafka](https://img.shields.io/badge/Kafka-Event%20Driven-231F20?logo=apache-kafka&logoColor=white)

The Resume Ecosystem is a monorepo that automatically builds a living resume from internships, hackathons, courses, and project completions. Each verified record is streamed through Kafka, persisted in Postgres via Prisma, and reflected in a modern React/TypeScript front-end.

---

## At a Glance

| Item                | Details |
|---------------------|---------|
| **Architecture**    | Event-driven microservices with Kafka topics |
| **Core Services**   | API Gateway, Auth, Activity, Verification, Resume, Integration, Notification, File Renderer |
| **Data Stores**     | PostgreSQL (Prisma), Redis cache |
| **Frontend**        | `services/web-app` (React + Vite + Tailwind) |
| **PDF Generation**  | File service using pdfkit |
| **Dev Commands**    | `npm run docker:up`, `npm run dev`, `npm run db:push`, `npm run seed` |

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Prerequisites](#prerequisites)
5. [Quick Start](#quick-start)
6. [Running the Frontend](#running-the-frontend)
7. [Service Reference](#service-reference)
8. [Database & Migrations](#database--migrations)
9. [Environment Variables](#environment-variables)
10. [Common Scripts](#common-scripts)
11. [UI Walkthrough](#ui-walkthrough)
12. [Troubleshooting](#troubleshooting)
13. [Next Steps](#next-steps)

---

## Architecture Overview

```
┌───────────┐         ┌──────────────┐        ┌────────────┐
│  Clients  │◄──────► │ API Gateway  │ ─────► │ Auth Svc   │
└───────────┘         └──────┬───────┘        └────┬───────┘
                              │                     │
                              ▼                     ▼
                       ┌────────────┐        ┌──────────────┐
                       │ Activity   │ ─────► │ Verification │
                       └─────┬──────┘        └────┬─────────┘
                             │   Kafka topics     │
                             ▼                    ▼
                       ┌────────────┐        ┌─────────────┐
                       │ Resume     │ ─────► │ Notification│
                       └────┬───────┘        └─────────────┘
                            │
                            ▼
                       ┌────────────┐
                       │ File Svc   │  → PDF resume
                       └────────────┘
```

* **Event-first:** Activity events (`activity.created`, `activity.verified`, `resume.version.published`) keep services decoupled.
* **API Gateway:** Single entry point for REST; issues JWT to downstream services.
* **Prisma & Postgres:** Each service owns schemas inside the shared database.
* **Redis:** Caching layer for verification lookups and rate-limiting.
* **Front-end:** React app consumes the gateway for auth, activities, resume state, and PDF rendering.

---

## Tech Stack

| Layer              | Libraries / Services |
|--------------------|----------------------|
| Runtime            | Node.js 20, TypeScript 5 |
| HTTP               | Fastify, Express, Axios |
| Data               | PostgreSQL, Prisma ORM |
| Messaging          | KafkaJS, Kafka UI |
| Cache              | Redis 7 |
| Front-end          | React 18, Vite, TailwindCSS, Zustand |
| PDF Renderer       | pdfkit |
| Tooling            | Docker Compose, Concurrently, ESLint, Prettier |

---

## Repository Structure

```
├── services/
│   ├── api-gateway/         # Fastify gateway providing REST facade
│   ├── auth-service/        # Sign-up / sign-in / JWT issuing
│   ├── activity-service/    # CRUD for activities & dedupe logic
│   ├── verification-service/# Hash / issuer verification flows
│   ├── resume-service/      # Resume builder, ranking, versioning
│   ├── integration-service/ # Webhook ingest, connectors
│   ├── notification-service/# Fan-out resume events
│   ├── file-service/        # Resume PDF rendering via pdfkit
│   └── web-app/             # React + Vite front-end
├── common-lib/              # Shared scoring utils and types
├── scripts/                 # Repo-level utilities (e.g., fix-build)
├── prisma/                  # Shared Prisma helpers
└── docker/docker-compose.yml
```

---

## Prerequisites

* Node.js **20.x** and npm **10.x**
* Docker Desktop (Compose v2)
* PostgreSQL, Redis, Kafka provided via Docker
* macOS/Linux/WSL2 recommended

---

## Quick Start

```bash
# 1. Install node dependencies
npm install

# 2. Start infrastructure (Postgres, Redis, Kafka, Kafka UI)
npm run docker:up

# 3. Apply database schema & generate Prisma clients
npm run db:push

# 4. Seed baseline users/activities (includes admin@example.com)
npm run seed

# 5. Launch all microservices + web app
npm run dev
```

Services boot on ports `4000-4070`; the web app runs on **http://localhost:5173** via the gateway proxy.

> 🔁 **Reset from scratch:** `npm run db:reset` drops all volumes, recreates containers, pushes schema, and seeds fresh data.

---

## Running the Frontend

The default `npm run dev` already starts `services/web-app`. To work on the UI alone:

```bash
npm run dev -w services/web-app
```

* Tailwind live reload, dark/light theme toggle via Zustand store.
* Front-end API base URL reads `VITE_API_BASE_URL` (defaults to `http://localhost:4000`).

Build for production:

```bash
npm run build -w services/web-app
```

---

## Service Reference

| Service | Port | Highlights |
|---------|------|------------|
| api-gateway | 4000 | JWT verification, proxy routes, rate limiting |
| auth-service | 4010 | Bcrypt hashing, Prisma user model, seed admin account |
| activity-service | 4020 | Activity CRUD, Jaccard dedupe, Kafka producer |
| verification-service | 4030 | Hash verification, LRU cache, emits `activity.verified` |
| resume-service | 4040 | Resume rebuild pipeline, ranking, version management |
| integration-service | 4050 | Webhook ingestion for external platforms |
| notification-service | 4060 | Resume publish notifications (email/WS webhook-ready) |
| file-service | 4070 | pdfkit HTML template rendering |

All services share TypeScript configs via `tsconfig.base.json` and use `@resume/services` for Fastify boilerplate.

---

## Database & Migrations

Each service owns its Prisma schema under `services/<service>/prisma/schema.prisma`. The root command orchestrates sequential pushes:

```bash
npm run db:push
```

Generate clients for a single service:

```bash
npm run prisma:generate -w services/auth-service
```

Seed all services:

```bash
npm run seed
```

Seed scripts populate:

* Admin user (`admin@example.com` / `password123`)
* Sample activities, trusted issuers, verification cases

---

## Environment Variables

Copy `.env.example` to `.env` at the repo root. Key values:

```ini
# Postgres & Prisma
POSTGRES_URL=postgresql://postgres:postgres@127.0.0.1:5432/resume_db
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/resume_db?schema=public"

# Auth
JWT_SECRET=supersecretkey

# Kafka & Redis
KAFKA_BROKER=localhost:9092
REDIS_URL=redis://localhost:6379

# Optional: front-end base
VITE_API_BASE_URL=http://localhost:4000
```

Each service also contains a `.env` with service-specific overrides (ports, secrets). Update only if you need custom networking.

---

## Common Scripts

| Command | Description |
|---------|-------------|
| `npm run docker:up` | Start Postgres, Redis, Kafka, Kafka UI |
| `npm run docker:down` | Stop containers (`docker compose down`) |
| `npm run db:push` | Apply Prisma schema for every service |
| `npm run seed` | Seed all service databases |
| `npm run db:reset` | Drop volumes, recreate infra, push schema, seed |
| `npm run dev` | Run all services & web app with live reload |
| `npm run build -ws` | Build all workspaces sequentially |
| `npm run lint` | Run ESLint across the monorepo |

---

## UI Walkthrough

| Page | Highlights |
|------|------------|
| **Login / Register** | Full-screen gradient, centered layout, dark/light mode toggle, validation messaging |
| **Dashboard** | Activity snapshot, recent activity timeline, live resume card with score & rebuild controls |
| **Activities** | Stacked layout (Add Activity → Activity list), responsive grid, badges for type/status, impact scoring |
| **Verification** | Awaiting queue, hash verification form, responsive chip layout, LRU-based cache messaging |
| **Resume** | Latest version, rebuild & PDF download actions, share link helper |
| **Profile** | Theme toggle, preference toggles, API token safety notes |

Front-end state is managed via Zustand stores (`auth`, `theme`, `activities`) for predictable persistence between sessions.

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| `KafkaJSNumberOfRetriesExceeded` | Ensure Docker containers are up (`npm run docker:up`) and retry service start |
| Postgres connection refused | Port 5432 blocked → stop local Postgres or change `POSTGRES_URL` to a free port |
| `npm run dev` exits immediately | Another service already listening on 4000-4070 → release ports or adjust `.env` |
| PDF download fails | Confirm file-service running on port 4070 and `VITE_API_BASE_URL` reachable |
| Activities not updating after verify | Run `npm run seed` or rebuild resume manually; check Kafka UI (`http://localhost:8080`) for stuck messages |

---

## Next Steps

* Integrate OAuth providers (LinkedIn, GitHub) for automatic activity ingestion.
* Deploy to Kubernetes with Helm and productionized Kafka (Confluent / Redpanda).
* Expand notification-service to push WebSocket and email alerts.
* Add E2E testing harness via Playwright or Cypress for the web app.

---

If you build something great with the Resume Ecosystem, share it! Feedback and contributions are welcome via issues or pull requests.
