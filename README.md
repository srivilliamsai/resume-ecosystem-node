# 🧠 Resume Ecosystem – Intelligent Resume & Career Platform

### 🚀 Node.js | Kafka | Postgres | Redis | Microservices | Prisma | Docker

A next-generation **Resume Building & Career Ecosystem** that automatically builds **dynamic, verified resumes** from real achievements — internships, hackathons, online courses, and projects — and updates them in real-time as users complete new activities.

---

## 📘 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Microservices](#microservices)
5. [Data Flow](#data-flow)
6. [Business Logic](#business-logic)
7. [Folder Structure](#folder-structure)
8. [Installation](#installation)
9. [Running the System](#running-the-system)
10. [API Endpoints](#api-endpoints)
11. [Events & Topics](#events--topics)
12. [Testing](#testing)
13. [Environment Variables](#environment-variables)
14. [Troubleshooting](#troubleshooting)
15. [Future Enhancements](#future-enhancements)

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

| Layer     | Technology                              |
| :-------- | :-------------------------------------- |
| Runtime   | Node.js 20+ (TypeScript/JavaScript)     |
| Framework | Express.js / Fastify                    |
| ORM       | Prisma with PostgreSQL                  |
| Cache     | Redis 7                                 |
| Messaging | KafkaJS (Kafka 3.7+)                    |
| Auth      | JWT (HS256/RS256)                       |
| Docs      | Swagger / OpenAPI                       |
| Infra     | Docker Compose                          |
| Testing   | Jest / Supertest / Testcontainers       |
| Utils     | Nodemon, Concurrently, ESLint, Prettier |

---

## 🧱 Microservices

| Service                  | Port   | Responsibility                                    |
| ------------------------ | ------ | ------------------------------------------------- |
| **api-gateway**          | `4000` | Central router, CORS, JWT pass-through            |
| **auth-service**         | `4001` | User registration, login, JWT issuance            |
| **activity-service**     | `4003` | Manage internships, courses, hackathons, projects |
| **verification-service** | `4004` | Verify authenticity (hash/signature/OAuth)        |
| **resume-service**       | `4005` | Build, rank, and version resumes                  |
| **integration-service**  | `4006` | Connect external APIs (GitHub, Coursera, etc.)    |
| **notification-service** | `4007` | Consume `resume.version.published` events         |
| **file-service**         | `4008` | Render resume PDFs and templates                  |

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
* Kafka & Postgres ports open (`9092`, `5432`)

### 1. Clone Repository

```bash
git clone https://github.com/<yourname>/resume-ecosystem.git
cd resume-ecosystem
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Infrastructure

```bash
cd docker
docker compose up -d
```

Services started:

* Kafka → localhost:9092
* Zookeeper → localhost:2181
* Postgres → localhost:5432
* Redis → localhost:6379
* Kafka UI → [http://localhost:8080](http://localhost:8080)

### 4. Run All Services

```bash
cd ..
npm run dev
```

---

## 🌐 API Endpoints

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
ACTIVITY_PORT=4003
VERIFY_PORT=4004
RESUME_PORT=4005
FILE_PORT=4008
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

## 🧭 Future Enhancements

* Add OAuth 2.0 full integration (Google, LinkedIn, Coursera)
* Implement GraphQL API gateway
* Introduce ML-powered Resume Scoring
* Add real-time WebSocket notifications
* Deploy to Kubernetes with Helm charts

---
