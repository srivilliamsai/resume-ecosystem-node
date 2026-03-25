// services/auth-service/src/utils/jwt.ts
// JWT signing and verification utilities
//
// SECURITY NOTE: The JWT_SECRET is validated at service startup by validateEnv().
// Never commit secrets to version control. See .env.example for setup instructions.

import * as jose from "jose";

// Get JWT secret from environment - no fallback in production
// The validateEnv() call in index.ts ensures this is set before we get here
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    "JWT_SECRET environment variable is not set. " +
    "This should have been caught by validateEnv() at startup."
  );
}

const secret = new TextEncoder().encode(jwtSecret);

// Configurable expiration time (default: 2 hours)
const expirationTime = process.env.JWT_EXPIRATION || "2h";

export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  roles: string[];
  [key: string]: unknown;
}

/**
 * Sign a JWT payload
 * @param payload - The data to include in the token
 * @returns Signed JWT string
 */
export async function sign(payload: JwtPayload): Promise<string> {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secret);
}

/**
 * Verify and decode a JWT
 * @param token - The JWT string to verify
 * @returns Decoded payload
 * @throws If the token is invalid or expired
 */
export async function verify(token: string): Promise<jose.JWTPayload> {
  const { payload } = await jose.jwtVerify(token, secret);
  return payload;
}
