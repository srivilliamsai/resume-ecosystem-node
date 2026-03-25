// services/auth-service/src/__tests__/jwt.test.ts
// Unit tests for JWT sign and verify utilities

import { sign, verify } from "../utils/jwt.js";
import * as jose from "jose";

describe("JWT Utilities", () => {
  const testPayload = {
    sub: "user-123",
    email: "test@example.com",
    name: "Test User",
    roles: ["USER"],
  };

  // ==========================================================================
  // sign() function
  // ==========================================================================
  describe("sign()", () => {
    it("should generate a valid JWT token", async () => {
      const token = await sign(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // Header.Payload.Signature
    });

    it("should include all payload fields in token", async () => {
      const token = await sign(testPayload);

      // Decode without verification to check payload
      const parts = token.split(".");
      const payloadJson = Buffer.from(parts[1], "base64url").toString();
      const decoded = JSON.parse(payloadJson);

      expect(decoded.sub).toBe(testPayload.sub);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.name).toBe(testPayload.name);
      expect(decoded.roles).toEqual(testPayload.roles);
    });

    it("should set issued at (iat) claim", async () => {
      const beforeSign = Math.floor(Date.now() / 1000);
      const token = await sign(testPayload);
      const afterSign = Math.floor(Date.now() / 1000);

      const parts = token.split(".");
      const decoded = JSON.parse(Buffer.from(parts[1], "base64url").toString());

      expect(decoded.iat).toBeGreaterThanOrEqual(beforeSign);
      expect(decoded.iat).toBeLessThanOrEqual(afterSign);
    });

    it("should set expiration (exp) claim", async () => {
      const token = await sign(testPayload);

      const parts = token.split(".");
      const decoded = JSON.parse(Buffer.from(parts[1], "base64url").toString());

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it("should use HS256 algorithm", async () => {
      const token = await sign(testPayload);

      const parts = token.split(".");
      const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());

      expect(header.alg).toBe("HS256");
    });

    it("should handle payload with optional fields", async () => {
      const minimalPayload = {
        sub: "user-456",
        email: "minimal@example.com",
        roles: [],
      };

      const token = await sign(minimalPayload);
      expect(token).toBeDefined();

      const parts = token.split(".");
      const decoded = JSON.parse(Buffer.from(parts[1], "base64url").toString());

      expect(decoded.sub).toBe(minimalPayload.sub);
      expect(decoded.email).toBe(minimalPayload.email);
    });

    it("should generate unique tokens for same payload", async () => {
      const token1 = await sign(testPayload);

      // Small delay to ensure different iat
      await new Promise((resolve) => setTimeout(resolve, 10));

      const token2 = await sign(testPayload);

      // Tokens should be different due to iat
      expect(token1).not.toBe(token2);
    });
  });

  // ==========================================================================
  // verify() function
  // ==========================================================================
  describe("verify()", () => {
    it("should verify and decode a valid token", async () => {
      const token = await sign(testPayload);
      const decoded = await verify(token);

      expect(decoded.sub).toBe(testPayload.sub);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.roles).toEqual(testPayload.roles);
    });

    it("should return full JWT payload with standard claims", async () => {
      const token = await sign(testPayload);
      const decoded = await verify(token);

      expect(decoded).toHaveProperty("iat");
      expect(decoded).toHaveProperty("exp");
      expect(decoded).toHaveProperty("sub");
    });

    it("should throw for expired token", async () => {
      // Create an expired token directly with jose
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const expiredToken = await new jose.SignJWT(testPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 7200) // 2 hours ago
        .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // 1 hour ago (expired)
        .sign(secret);

      await expect(verify(expiredToken)).rejects.toThrow();
    });

    it("should throw for malformed token", async () => {
      await expect(verify("not-a-valid-jwt")).rejects.toThrow();
    });

    it("should throw for token with wrong signature", async () => {
      const token = await sign(testPayload);
      const parts = token.split(".");

      // Create token with modified signature
      const tamperedToken = `${parts[0]}.${parts[1]}.tampered_signature`;

      await expect(verify(tamperedToken)).rejects.toThrow();
    });

    it("should throw for token signed with different secret", async () => {
      // Create a token with a different secret
      const wrongSecret = new TextEncoder().encode("wrong-secret-key");
      const wrongToken = await new jose.SignJWT(testPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("2h")
        .sign(wrongSecret);

      await expect(verify(wrongToken)).rejects.toThrow();
    });

    it("should throw for token with modified payload", async () => {
      const token = await sign(testPayload);
      const parts = token.split(".");

      // Modify the payload
      const modifiedPayload = {
        ...testPayload,
        roles: ["ADMIN"], // Try to escalate privileges
      };
      const modifiedPayloadB64 = Buffer.from(
        JSON.stringify(modifiedPayload)
      ).toString("base64url");

      const tamperedToken = `${parts[0]}.${modifiedPayloadB64}.${parts[2]}`;

      await expect(verify(tamperedToken)).rejects.toThrow();
    });

    it("should throw for empty token", async () => {
      await expect(verify("")).rejects.toThrow();
    });

    it("should throw for token with only dots", async () => {
      await expect(verify("...")).rejects.toThrow();
    });

    it("should handle token verification concurrently", async () => {
      const tokens = await Promise.all([
        sign({ ...testPayload, sub: "user-1" }),
        sign({ ...testPayload, sub: "user-2" }),
        sign({ ...testPayload, sub: "user-3" }),
      ]);

      const results = await Promise.all(tokens.map((t) => verify(t)));

      expect(results[0].sub).toBe("user-1");
      expect(results[1].sub).toBe("user-2");
      expect(results[2].sub).toBe("user-3");
    });
  });

  // ==========================================================================
  // Integration: sign then verify
  // ==========================================================================
  describe("sign() and verify() integration", () => {
    it("should roundtrip correctly", async () => {
      const originalPayload = {
        sub: "roundtrip-user",
        email: "roundtrip@example.com",
        name: "Roundtrip Test",
        roles: ["USER", "ADMIN"],
      };

      const token = await sign(originalPayload);
      const decoded = await verify(token);

      expect(decoded.sub).toBe(originalPayload.sub);
      expect(decoded.email).toBe(originalPayload.email);
      expect(decoded.name).toBe(originalPayload.name);
      expect(decoded.roles).toEqual(originalPayload.roles);
    });

    it("should handle special characters in payload", async () => {
      const specialPayload = {
        sub: "user-special",
        email: "test+special@example.com",
        name: "Test User with émojis 🎉",
        roles: ["USER"],
      };

      const token = await sign(specialPayload);
      const decoded = await verify(token);

      expect(decoded.name).toBe(specialPayload.name);
      expect(decoded.email).toBe(specialPayload.email);
    });

    it("should handle payload with extra fields", async () => {
      const extendedPayload = {
        sub: "extended-user",
        email: "extended@example.com",
        roles: ["USER"],
        customField: "custom-value",
        nestedObject: { key: "value" },
      };

      const token = await sign(extendedPayload as any);
      const decoded = await verify(token);

      expect(decoded.customField).toBe("custom-value");
      expect(decoded.nestedObject).toEqual({ key: "value" });
    });
  });
});
