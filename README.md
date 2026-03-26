# 🧠 Resume Ecosystem – Intelligent Resume & Career Platform

### 🚀 Node.js | Kafka | Postgres | Redis | Microservices | Prisma | Docker

A next-generation **Resume Building & Career Ecosystem** that automatically builds **dynamic, verified resumes** from real achievements — internships, hackathons, online courses, and projects — and updates them in real-time as users complete new activities.

---

## 📘 Table of Contents

1. [Overview](#overview)
2. [Quick Demo](#quick-demo)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Microservices](#microservices)
6. [Data Flow](#data-flow)
7. [Business Logic](#business-logic)
8. [Folder Structure](#folder-structure)
9. [Installation](#installation)
10. [Running the System](#running-the-system)
11. [API Endpoints](#api-endpoints)
12. [Events & Topics](#events--topics)
13. [Testing](#testing)
14. [Environment Variables](#environment-variables)
15. [Troubleshooting](#troubleshooting)
16. [Future Enhancements](#future-enhancements)

---

## 🧩 Overview

**Goal:**
To create a connected backend that integrates multiple sub-platforms — Internship Platforms, Hackathon Platforms, Online Learning Systems, and Project Verification Modules — into a unified ecosystem where verified achievements automatically update a student’s professional resume.

**Key Features**

* Auto-generated verified resumes (real-time updates)
* API gateway for unified routing
* JWT-based authentication
* Kafka-driven event system
* Postgres-backed persistence with Prisma ORM
* Redis caching and rate-limiting
* Resume versioning and ranking logic
* PDF rendering service
* Integration with GitHub, Coursera, and other platforms

---

## 🚀 Quick Demo (60 seconds)

Get a fully working resume ecosystem with real data in one command:

```bash
npm run demo
```

Then open http://localhost:5173 and log in with any demo account:

| Name | Email | Password | Resume Score |
|------|-------|----------|--------------|
| Arjun Sharma (CS Student) | arjun@demo.com | demo1234 | 87/100 |
| Priya Nair (Bootcamp Grad) | priya@demo.com | demo1234 | 72/100 |
| Rahul Mehta (Senior Dev) | rahul@demo.com | demo1234 | 95/100 |

### 📸 Screenshots
> Run `npm run demo` to see the full UI live.

```
+-------------------------------------------------------------+
|  RESUME ECOSYSTEM DASHBOARD                        [Logout] |
|                                                             |
|  Welcome back, Arjun!                                       |
|  Resume Score: 87/100 (Top 10%)                             |
|                                                             |
|  [ Recent Activities ]                                      |
|  ---------------------------------------------------------  |
|  • Google Summer of Code 2024          [VERIFIED]  +15 pts  |
|  • AWS Solutions Architect             [VERIFIED]  +10 pts  |
|  • Smart India Hackathon Finalist      [VERIFIED]  +12 pts  |
|                                                             |
|  [ Your Resume ]                                            |
|  ---------------------------------------------------------  |
|  [View PDF]  [Share Link]  [History]                        |
|                                                             |
+-------------------------------------------------------------+
```

---

## 🏗️ Architecture

```
Integration → Activity → Verification → Resume → Notification → File Renderer
                       ↘ Auth & JWT Gateway ↗
```

* **Event-driven microservice architecture** (loosely coupled)
* Communication via **Kafka** topics
* Shared utilities via **common-lib**
* Each service is independently deployable and testable

---

## ⚙️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | **React 18**, **TypeScript**, **TailwindCSS**, **Vite** |
| **Backend** | **Node.js 20+**, **Fastify**, **Express** |
| **Database** | **PostgreSQL** (via Supabase or Local Docker) |
| **ORM** | **Prisma** (Schema-driven data access) |
| **Messaging** | **Kafka** (Event-driven architecture) |
| **Cache** | **Redis** (Rate limiting & caching) |
| **Auth** | **JWT** (Stateless authentication) |
| **Docs** | **Swagger / OpenAPI** |
| **Infrastructure** | **Docker Compose** |

---

## 🧱 Microservices

| Service | Port | Responsibility |
| :--- | :--- | :--- |
| **web-app** | `5173` | Modern React Frontend Dashboard |
| **api-gateway** | `4000` | Central router, CORS, JWT pass-through |
| **auth-service** | `4010` | User registration, login, JWT issuance |
| **activity-service** | `4020` | Manage internships, courses, hackathons |
| **verification-service** | `4030` | Verify authenticity (hash/signature) |
| **resume-service** | `4040` | Build, rank, and version resumes |
| **integration-service** | `4050` | Connect external APIs (GitHub, LinkedIn) |
| **notification-service** | `4060` | Email & WebSocket notifications |
| **file-service** | `4070` | Render resume PDFs |

---

---

## 🔄 Data Flow

1. **User adds an activity** →
   `activity.created` event emitted.

2. **Verification service** listens →
   validates authenticity → emits `activity.verified`.

3. **Resume service** consumes verified event →
   rebuilds and re-scores resume → emits `resume.version.published`.

4. **Notification service** consumes publish event →
   notifies user via email/WS.

5. **File service** allows rendering of the latest resume as PDF.

---

## 🧠 Business Logic

### 1. Activity Deduplication

Detect duplicate entries using **Jaccard similarity** between titles:

```
similarity = |tokensA ∩ tokensB| / |tokensA ∪ tokensB|
```

If ≥ 0.7 → reject as duplicate (HTTP 409).

### 2. Verification Cache

LRU cache of recent 1000 verifications to avoid redundant checks.

### 3. Resume Ranking

Each activity contributes to resume score:

```
score = base*0.5 + (trust/100)*0.3 + ln(1+impact)*0.2 + 5*exp(-daysSinceEnd/365)
```

Top-K selection per section.

### 4. Event Topics

* `activity.created`
* `activity.verified`
* `resume.version.published`
* `integration.webhook.received`

---

## 📂 Folder Structure

```
resume-ecosystem/
├── package.json
├── .env.example
├── docker/
│   └── docker-compose.yml
├── common-lib/
│   ├── src/index.ts
│   └── package.json
└── services/
    ├── api-gateway/
    ├── auth-service/
    ├── activity-service/
    ├── verification-service/
    ├── resume-service/
    ├── integration-service/
    ├── notification-service/
    └── file-service/
```

---

## ⚡ Installation

### Prerequisites

* Node.js ≥ 20
* Docker & Docker Compose
* npm / pnpm

### 1. Clone Repository

```bash
git clone https://github.com/srivilliamsai/resume-ecosystem-node.git
cd resume-ecosystem-node
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Infrastructure (Database & Kafka)

```bash
npm run docker:up
```
> Wait 10-15 seconds for containers to initialize.

### 4. Initialize Database

```bash
npm run db:push
npm run seed  # (Optional: Populates demo data)
```

### 5. Run Full Stack (Frontend + Backend)

```bash
npm run dev
```

---

## 🌐 Access Points

| Application | URL |
| :--- | :--- |
| **Frontend Dashboard** | [http://localhost:5173](http://localhost:5173) |
| **API Documentation** | [http://localhost:4000/docs](http://localhost:4000/docs) |
| **Kafka UI** | [http://localhost:8080](http://localhost:8080) |
| **Prisma Studio** | `npx prisma studio` |

---

### Auth Service

| Method | Endpoint         | Description                |
| ------ | ---------------- | -------------------------- |
| POST   | `/auth/register` | Register new user          |
| POST   | `/auth/token`    | Issue JWT token            |
| GET    | `/auth/me`       | Return logged-in user info |

### Activity Service

| Method | Endpoint          | Description         |
| ------ | ----------------- | ------------------- |
| POST   | `/activities`     | Create activity     |
| GET    | `/activities`     | List all activities |
| GET    | `/activities/:id` | Get single activity |

### Verification Service

| POST | `/verify/:activityId/hash` | Hash verification |
| GET | `/verify/status/:activityId` | Get status |

### Resume Service

| GET | `/resume/me` | Current resume |
| POST | `/resume/rebuild` | Force rebuild |
| GET | `/resume/versions` | Resume history |

### File Service

| POST | `/render` | Render resume PDF |

---

## 📡 Events & Topics

| Topic                          | Producer             | Consumer             | Description               |
| ------------------------------ | -------------------- | -------------------- | ------------------------- |
| `activity.created`             | Activity Service     | Verification Service | Triggers verification     |
| `activity.verified`            | Verification Service | Resume Service       | Rebuild resume            |
| `resume.version.published`     | Resume Service       | Notification Service | Notify user               |
| `integration.webhook.received` | Integration Service  | Activity Service     | Add new external activity |

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Key Test Suites

* Unit Tests (Jest/Vitest)
* Integration Tests (Testcontainers for Kafka/Postgres)
* E2E Tests (Supertest on Gateway)

---

## ⚙️ Environment Variables

📄 `.env.example`

```
# Common
NODE_ENV=development
JWT_SECRET=supersecret

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASS=root
DB_NAME=resume_db

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=resume-ecosystem

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Ports
AUTH_PORT=4010
ACTIVITY_PORT=4020
VERIFY_PORT=4030
RESUME_PORT=4040
INTEGRATION_PORT=4050
NOTIFY_PORT=4060
FILE_PORT=4070
```

---

## 🧰 Troubleshooting

| Issue                   | Cause                         | Fix                         |
| ----------------------- | ----------------------------- | --------------------------- |
| Kafka connection failed | Broker not running            | `docker compose up -d`      |
| Port conflict           | Existing service on same port | Change port in `.env`       |
| Database not reachable  | Wrong credentials             | Check `.env` or Docker logs |
| Resume not updating     | Kafka consumer group stuck    | Restart resume-service      |
| PDF not rendering       | Puppeteer missing             | Reinstall dependencies      |

---

## 🧭 Roadmap

- [x] **Frontend:** React + Tailwind Dashboard
- [x] **Backend:** 8 Microservices Architecture
- [x] **Messaging:** Kafka Event Pipeline
- [x] **Database:** PostgreSQL + Prisma Schema
- [ ] **Auth:** OAuth 2.0 (Google/GitHub/LinkedIn)
- [ ] **Deployment:** Docker & Kubernetes Helm Charts
- [ ] **AI:** Resume Scoring & Suggestion Engine

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
