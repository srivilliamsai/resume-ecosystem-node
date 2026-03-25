// services/auth-service/prisma/seed.ts
// Database seed script for auth-service
//
// SECURITY WARNING: This script creates an admin user for initial setup.
// In production:
//   1. Use strong, unique credentials via environment variables
//   2. Change the admin password immediately after first login
//   3. Consider setting SEED_SKIP=true after initial setup
//
// Environment Variables:
//   SEED_ADMIN_EMAIL    - Admin user email (default: admin@example.com)
//   SEED_ADMIN_PASSWORD - Admin user password (REQUIRED in production)
//   SEED_ADMIN_NAME     - Admin user display name (default: Administrator)
//   SEED_SKIP           - Set to "true" to skip seeding entirely

import { PrismaClient } from "../src/generated/client/index.js";
import crypto from "crypto";

const prisma = new PrismaClient();

// Weak passwords that should never be used in production
const WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  'password1',
  '123456',
  '12345678',
  'admin',
  'admin123',
  'changeme',
  'secret',
  'test',
  'test123',
]);

// Hash function matching the one in src/utils/pw.ts
function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(8).toString("hex");
  return salt + ":" + crypto.pbkdf2Sync(pw, salt, 10000, 32, "sha256").toString("hex");
}

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';

  // Check if seeding should be skipped
  if (process.env.SEED_SKIP === 'true') {
    console.log('[seed] SEED_SKIP=true, skipping database seeding');
    return;
  }

  // Get seed credentials from environment
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'Administrator';

  // Validate password in production
  if (isProduction) {
    if (!password) {
      console.error(
        '\n[seed] FATAL: SEED_ADMIN_PASSWORD is required in production mode.\n' +
        'Set SEED_ADMIN_PASSWORD in your environment or set SEED_SKIP=true.\n'
      );
      process.exit(1);
    }

    if (WEAK_PASSWORDS.has(password.toLowerCase())) {
      console.error(
        '\n[seed] FATAL: SEED_ADMIN_PASSWORD is a known weak password.\n' +
        'Please use a strong, unique password for production.\n'
      );
      process.exit(1);
    }

    if (password.length < 12) {
      console.error(
        '\n[seed] FATAL: SEED_ADMIN_PASSWORD is too short (minimum 12 characters).\n'
      );
      process.exit(1);
    }
  }

  // In development, use a placeholder if no password provided
  // The marker indicates this account should not be used for login
  const finalPassword = password || 'SEED_DISABLED_SET_SEED_ADMIN_PASSWORD';
  const isLoginDisabled = !password;

  // Hash the password using the same algorithm as src/utils/pw.ts
  // Special marker for disabled login that the compare function will never match
  const hashedPassword = isLoginDisabled
    ? 'seed:disabled:login:not-a-valid-hash'
    : hashPassword(finalPassword);

  // Create or update the admin user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      // Don't update password if user already exists (prevents accidental resets)
    },
    create: {
      email,
      name,
      password: hashedPassword,
      roles: ['ADMIN', 'USER'],
    },
  });

  console.log(`[seed] Seeded admin user: ${user.email}`);

  if (isLoginDisabled) {
    console.warn(
      '\n' +
      '='.repeat(70) + '\n' +
      '[seed] WARNING: Admin user created with login DISABLED\n' +
      '='.repeat(70) + '\n' +
      '\n' +
      'To enable login, set SEED_ADMIN_PASSWORD environment variable and re-run:\n' +
      '  export SEED_ADMIN_PASSWORD="your-secure-password-here"\n' +
      '  npm run seed -w services/auth-service\n' +
      '\n' +
      '='.repeat(70) + '\n'
    );
  } else if (!isProduction) {
    console.warn(
      '\n' +
      '[seed] NOTE: Using seeded credentials in development mode.\n' +
      'For production, ensure you use strong, unique credentials.\n'
    );
  }
}

main()
  .catch((e) => {
    console.error('[seed] Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
