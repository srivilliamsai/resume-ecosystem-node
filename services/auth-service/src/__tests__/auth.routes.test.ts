// services/auth-service/src/__tests__/auth.routes.test.ts
// Integration tests for auth-service routes
// Tests cover: register, login (token), and /auth/me endpoint

import { FastifyInstance } from "fastify";
import {
  buildTestApp,
  createTestUser,
  createTestToken,
  uniqueEmail,
  withAuth,
  TestUser,
} from "../test/helpers.js";

describe("Auth Routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // ==========================================================================
  // POST /auth/register
  // ==========================================================================
  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const email = uniqueEmail();
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email,
          name: "New User",
          password: "SecurePassword123!",
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty("id");
      expect(body).toHaveProperty("email", email);
      expect(body).not.toHaveProperty("password"); // Password should not be returned
    });

    it("should return 409 for duplicate email", async () => {
      const email = uniqueEmail();

      // First registration - should succeed
      await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email,
          name: "First User",
          password: "Password123!",
        },
      });

      // Second registration with same email - should fail
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email,
          name: "Second User",
          password: "DifferentPassword123!",
        },
      });

      expect(response.statusCode).toBe(409);

      const body = response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toContain("exists");
    });

    it("should handle registration with minimal data", async () => {
      const email = uniqueEmail();
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email,
          password: "MinimalPassword123!",
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty("id");
      expect(body).toHaveProperty("email", email);
    });

    it("should register user with empty name", async () => {
      const email = uniqueEmail();
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email,
          name: "",
          password: "Password123!",
        },
      });

      // Should still succeed as name is optional
      expect(response.statusCode).toBe(200);
    });

    it("should handle registration with special characters in email", async () => {
      const email = `test+tag-${Date.now()}@example.com`;
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email,
          name: "Special Email User",
          password: "Password123!",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty("email", email);
    });
  });

  // ==========================================================================
  // POST /auth/token (login)
  // ==========================================================================
  describe("POST /auth/token (login)", () => {
    let testUser: TestUser;

    beforeEach(async () => {
      testUser = await createTestUser({
        email: uniqueEmail(),
        password: "CorrectPassword123!",
      });
    });

    it("should return JWT token for valid credentials", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/token",
        payload: {
          email: testUser.email,
          password: testUser.plainPassword,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty("token");
      expect(body.token).toBeValidJWT();
      expect(body).toHaveProperty("user");
      expect(body.user).toHaveProperty("id", testUser.id);
      expect(body.user).toHaveProperty("email", testUser.email);
      expect(body.user).toHaveProperty("roles");
      expect(body.user).not.toHaveProperty("password");
    });

    it("should return 401 for wrong password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/token",
        payload: {
          email: testUser.email,
          password: "WrongPassword123!",
        },
      });

      expect(response.statusCode).toBe(401);

      const body = response.json();
      expect(body).toHaveProperty("error");
      expect(body.error.toLowerCase()).toContain("invalid");
    });

    it("should return 401 for non-existent user", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/token",
        payload: {
          email: "nonexistent@example.com",
          password: "AnyPassword123!",
        },
      });

      expect(response.statusCode).toBe(401);

      const body = response.json();
      expect(body).toHaveProperty("error");
    });

    it("should return 401 for empty password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/token",
        payload: {
          email: testUser.email,
          password: "",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 401 for missing password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/token",
        payload: {
          email: testUser.email,
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return user roles in response", async () => {
      const adminUser = await createTestUser({
        email: uniqueEmail(),
        password: "AdminPassword123!",
        roles: ["ADMIN", "USER"],
      });

      const response = await app.inject({
        method: "POST",
        url: "/auth/token",
        payload: {
          email: adminUser.email,
          password: adminUser.plainPassword,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body.user.roles).toContain("ADMIN");
      expect(body.user.roles).toContain("USER");
    });

    it("should be case-sensitive for password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/token",
        payload: {
          email: testUser.email,
          password: testUser.plainPassword.toUpperCase(),
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // ==========================================================================
  // GET /auth/me (protected endpoint)
  // ==========================================================================
  describe("GET /auth/me", () => {
    let testUser: TestUser;
    let validToken: string;

    beforeEach(async () => {
      testUser = await createTestUser({
        email: uniqueEmail(),
        password: "Password123!",
      });
      validToken = await createTestToken(testUser);
    });

    it("should return user payload for valid token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: withAuth(validToken),
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty("sub", testUser.id);
      expect(body).toHaveProperty("email", testUser.email);
      expect(body).toHaveProperty("roles");
    });

    it("should return 401 for missing token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
      });

      expect(response.statusCode).toBe(401);

      const body = response.json();
      expect(body).toHaveProperty("error");
      expect(body.error.toLowerCase()).toContain("no token");
    });

    it("should return 401 for invalid token format", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: withAuth("not-a-valid-jwt"),
      });

      expect(response.statusCode).toBe(401);

      const body = response.json();
      expect(body).toHaveProperty("error");
    });

    it("should return 401 for malformed Authorization header", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: {
          authorization: "InvalidFormat",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 401 for tampered token", async () => {
      // Modify the token signature
      const tamperedToken = validToken.slice(0, -5) + "XXXXX";

      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: withAuth(tamperedToken),
      });

      expect(response.statusCode).toBe(401);
    });

    it("should accept token with Bearer prefix (case insensitive)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: {
          authorization: `bearer ${validToken}`,
        },
      });

      // Should still work as the code uses .replace("Bearer ", "")
      // Note: This might fail if implementation is case-sensitive
      expect(response.statusCode).toBe(200);
    });

    it("should include token claims in response", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: withAuth(validToken),
      });

      const body = response.json();

      // JWT standard claims
      expect(body).toHaveProperty("iat"); // Issued at
      expect(body).toHaveProperty("exp"); // Expiration
    });
  });

  // ==========================================================================
  // Health Endpoint
  // ==========================================================================
  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty("status", "ok");
      expect(body).toHaveProperty("service", "auth-service");
    });
  });
});
