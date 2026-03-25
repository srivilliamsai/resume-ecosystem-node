# Contributing to Resume Ecosystem

Thank you for your interest in contributing to **Resume Ecosystem**! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Workflow](#pull-request-workflow)
- [Running Tests](#running-tests)
- [Adding a New Service](#adding-a-new-service)
- [Need Help?](#need-help)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and harassment-free environment for everyone. Be kind, constructive, and collaborative.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/resume-ecosystem-node.git
   cd resume-ecosystem-node
   ```
3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/srivilliamsai/resume-ecosystem-node.git
   ```
4. **Create a branch** for your work (see [Branch Naming](#branch-naming)):
   ```bash
   git checkout -b feat/my-new-feature
   ```

---

## Development Setup

### Prerequisites

- **Node.js** ≥ 20
- **Docker** & **Docker Compose**
- **npm** (comes with Node.js)

### Install Dependencies

```bash
npm install
```

### Start Infrastructure

```bash
npm run docker:up
```

This starts PostgreSQL, Kafka, Zookeeper, and Redis via Docker Compose.

### Generate Prisma Clients

```bash
npm run prisma:generate
```

### Run Database Migrations

```bash
npm run migrate
```

### Seed the Database (optional)

```bash
npm run seed
```

### Run All Services (development mode)

```bash
npm run dev
```

This starts all 8 microservices concurrently using `nodemon` for hot-reloading.

### Environment Variables

Copy `.env.example` to `.env` and fill in any required values:

```bash
cp .env.example .env
```

> **⚠️ Security:** Never commit real secrets. Use the provided `npm run generate-secrets` script to generate secure JWT secrets.

---

## Branch Naming

Use the following prefixes:

| Prefix       | Purpose                          | Example                         |
|-------------|----------------------------------|---------------------------------|
| `feat/`     | New feature                      | `feat/oauth-linkedin`           |
| `fix/`      | Bug fix                          | `fix/jwt-expiry-handling`       |
| `docs/`     | Documentation only               | `docs/update-api-endpoints`     |
| `refactor/` | Code restructuring (no behavior change) | `refactor/extract-kafka-utils` |
| `test/`     | Adding or fixing tests           | `test/auth-service-unit-tests`  |
| `chore/`    | Tooling, CI, dependencies        | `chore/upgrade-prisma-6`        |
| `perf/`     | Performance improvement          | `perf/redis-cache-optimization` |

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type         | Description                                    |
|-------------|------------------------------------------------|
| `feat`      | A new feature                                  |
| `fix`       | A bug fix                                      |
| `docs`      | Documentation changes                          |
| `style`     | Formatting, whitespace (no logic changes)      |
| `refactor`  | Code change that neither fixes a bug nor adds a feature |
| `test`      | Adding or correcting tests                     |
| `chore`     | Build process, CI, or tooling changes          |
| `perf`      | Performance improvement                        |
| `ci`        | CI/CD configuration changes                    |

### Scopes

Use the service name as the scope: `auth`, `activity`, `verification`, `resume`, `notification`, `integration`, `file`, `gateway`, `common-lib`, `docker`, `ci`.

### Examples

```
feat(notification): add WebSocket broadcast for resume published events
fix(auth): handle expired JWT tokens gracefully
docs(readme): update API endpoints table
test(activity): add Jaccard deduplication edge cases
chore(docker): add Jaeger and Prometheus to docker-compose
```

### Breaking Changes

Append `!` after the type/scope and include a `BREAKING CHANGE:` footer:

```
feat(auth)!: switch from HS256 to RS256 JWT signing

BREAKING CHANGE: All existing JWT tokens will be invalid after this change.
Clients must re-authenticate.
```

---

## Pull Request Workflow

1. **Sync with upstream** before starting:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Make your changes** on your feature branch.

3. **Run linting and tests** before pushing:
   ```bash
   npm run test
   ```

4. **Push your branch** to your fork:
   ```bash
   git push origin feat/my-feature
   ```

5. **Open a Pull Request** against `main` on the upstream repo.

6. **Fill in the PR template** — describe what changed and why.

7. **Respond to review feedback** by pushing additional commits.

8. Once approved, a maintainer will **squash and merge** your PR.

### PR Checklist

- [ ] Code follows the existing style and patterns
- [ ] Self-reviewed my own code
- [ ] Added/updated tests as appropriate
- [ ] Updated documentation (README, JSDoc, etc.) if needed
- [ ] No new TypeScript errors (`npx tsc --noEmit`)
- [ ] Commit messages follow Conventional Commits

---

## Running Tests

```bash
# Run all tests
npm run test

# Run tests for a specific service
npm run test:auth

# Run with coverage
npm run test:coverage

# Run in CI mode (no watch)
npm run test:ci
```

### Test Database

Tests use a separate PostgreSQL database. Start it with:

```bash
npm run docker:test:up
```

Tear it down after:

```bash
npm run docker:test:down
```

---

## Adding a New Service

1. **Create the directory:**
   ```bash
   mkdir -p services/my-service/src services/my-service/prisma
   ```

2. **Copy the template** from an existing service (e.g., `notification-service`):
   - `package.json` — update `name` and dependencies
   - `tsconfig.json` — extend `../../tsconfig.base.json`
   - `prisma/schema.prisma` — define your models
   - `src/index.ts` — entrypoint
   - `src/server.ts` — Fastify server builder using `buildServer()`

3. **Assign a port** from the reserved range (4000–4070). Check existing assignments in `README.md`.

4. **Add to `docker-compose.yml`** if the service needs its own container.

5. **Add to the root `package.json`** dev script (in the `concurrently` command).

6. **Add Kafka topics** (if needed) to `common-lib/src/index.ts` in the `Topics` object.

7. **Run `npm install`** from the repo root to register the new workspace.

---

## Need Help?

- 💬 Open a [GitHub Discussion](https://github.com/srivilliamsai/resume-ecosystem-node/discussions)
- 🐛 File a [Bug Report](https://github.com/srivilliamsai/resume-ecosystem-node/issues/new?template=bug_report.md)
- 💡 Request a [Feature](https://github.com/srivilliamsai/resume-ecosystem-node/issues/new?template=feature_request.md)

Thank you for contributing! 🎉
