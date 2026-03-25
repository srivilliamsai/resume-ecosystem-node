// services/auth-service/src/test/setup.ts
// Jest test setup - runs before all tests
// Manages test database lifecycle and environment variables

import { PrismaClient } from "../generated/client/index.js";
import { execSync } from "child_process";

// Test database URL - uses a separate test database on port 5433 (docker-compose.test.yml)
// Or use TEST_DATABASE_URL env var to override
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5433/resume_test_db";

// Set environment variables for tests
process.env.NODE_ENV = "test";
process.env.POSTGRES_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = "test-jwt-secret-that-is-long-enough-for-testing-purposes-only";
process.env.JWT_EXPIRATION = "1h";

let prisma: PrismaClient;

// Global setup - runs once before all test files
beforeAll(async () => {
  // Create Prisma client for tests
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: TEST_DATABASE_URL,
      },
    },
    log: ["error"],
  });

  try {
    // Push schema to test database (creates tables if they don't exist)
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      env: {
        ...process.env,
        POSTGRES_URL: TEST_DATABASE_URL,
      },
      stdio: "pipe",
    });

    // Connect to database
    await prisma.$connect();
    console.log("Test database connected");
  } catch (error) {
    console.error("Failed to setup test database:", error);
    throw error;
  }

  // Make prisma available globally for tests
  (globalThis as any).__TEST_PRISMA__ = prisma;
});

// Cleanup after each test - clear data but keep schema
afterEach(async () => {
  const prisma = (globalThis as any).__TEST_PRISMA__ as PrismaClient;

  if (prisma) {
    // Delete all data in reverse order of dependencies
    const deleteOrder = [
      "ResumeVersion",
      "Resume",
      "VerificationCase",
      "AchievementArtifact",
      "Activity",
      "User",
      "TrustedIssuer",
    ];

    for (const model of deleteOrder) {
      try {
        await (prisma as any)[model.charAt(0).toLowerCase() + model.slice(1)].deleteMany({});
      } catch (e) {
        // Ignore errors for models that might not exist
      }
    }
  }
});

// Global teardown - runs once after all test files
afterAll(async () => {
  const prisma = (globalThis as any).__TEST_PRISMA__ as PrismaClient;

  if (prisma) {
    await prisma.$disconnect();
    console.log("Test database disconnected");
  }
});

// Export test prisma client getter
export function getTestPrisma(): PrismaClient {
  return (globalThis as any).__TEST_PRISMA__;
}

// Extend Jest matchers
expect.extend({
  toBeValidJWT(received: string) {
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    const pass = jwtPattern.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid JWT`
          : `Expected ${received} to be a valid JWT`,
    };
  },
});

// TypeScript declaration for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidJWT(): R;
    }
  }
}
