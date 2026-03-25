// services/auth-service/src/test/helpers.ts
// Test helper utilities for auth-service tests

import { FastifyInstance } from "fastify";
import { PrismaClient } from "../generated/client/index.js";
import { buildServer } from "../server.js";
import { routes } from "../routes/auth.js";
import { hash } from "../utils/pw.js";
import { sign } from "../utils/jwt.js";

/**
 * Build a test server instance
 * Does not start the server - just returns the configured instance
 */
export function buildTestApp(): FastifyInstance {
  return buildServer("auth-service", routes, { logger: false });
}

/**
 * Get the test Prisma client
 */
export function getTestPrisma(): PrismaClient {
  return (globalThis as any).__TEST_PRISMA__;
}

/**
 * Test user data interface
 */
export interface TestUser {
  id: string;
  email: string;
  name: string;
  password: string; // Hashed password
  plainPassword: string; // Original password for testing
  roles: string[];
}

/**
 * Create a test user in the database
 */
export async function createTestUser(
  overrides: Partial<{
    email: string;
    name: string;
    password: string;
    roles: string[];
  }> = {}
): Promise<TestUser> {
  const prisma = getTestPrisma();
  const plainPassword = overrides.password || "TestPassword123!";
  const hashedPassword = await hash(plainPassword);

  const userData = {
    email: overrides.email || `test-${Date.now()}@example.com`,
    name: overrides.name || "Test User",
    password: hashedPassword,
    roles: overrides.roles || ["USER"],
  };

  const user = await prisma.user.create({
    data: userData,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name || userData.name,
    password: user.password || hashedPassword,
    plainPassword,
    roles: user.roles,
  };
}

/**
 * Create a valid JWT token for testing
 */
export async function createTestToken(user: {
  id: string;
  email: string;
  name?: string;
  roles: string[];
}): Promise<string> {
  return sign({
    sub: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
  });
}

/**
 * Create an expired JWT token for testing
 * Note: This requires temporarily changing JWT_EXPIRATION
 */
export async function createExpiredToken(user: {
  id: string;
  email: string;
  name?: string;
  roles: string[];
}): Promise<string> {
  // Save original expiration
  const originalExpiration = process.env.JWT_EXPIRATION;

  // Set very short expiration
  process.env.JWT_EXPIRATION = "1ms";

  // We need to reimport to get the new expiration
  // Since this is tricky with ESM, we'll use jose directly
  const jose = await import("jose");
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const token = await new jose.SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(Math.floor(Date.now() / 1000) - 7200) // 2 hours ago
    .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // 1 hour ago
    .sign(secret);

  // Restore original expiration
  process.env.JWT_EXPIRATION = originalExpiration;

  return token;
}

/**
 * Make a request with authorization header
 */
export function withAuth(token: string): { authorization: string } {
  return { authorization: `Bearer ${token}` };
}

/**
 * Generate a unique email address for testing
 */
export function uniqueEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

/**
 * Random string generator for test data
 */
export function randomString(length: number = 10): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
