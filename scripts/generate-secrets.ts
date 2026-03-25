#!/usr/bin/env npx ts-node
// scripts/generate-secrets.ts
// Utility script to generate secure secrets for the resume-ecosystem-node project
//
// Usage:
//   npx ts-node scripts/generate-secrets.ts
//   npx ts-node scripts/generate-secrets.ts --env  # Output as .env format
//   npx ts-node scripts/generate-secrets.ts --json # Output as JSON

import crypto from "crypto";

interface Secret {
  name: string;
  description: string;
  value: string;
  bytes: number;
}

function generateSecret(bytes: number = 64): string {
  return crypto.randomBytes(bytes).toString("base64");
}

function generateSecrets(): Secret[] {
  return [
    {
      name: "JWT_SECRET",
      description: "JWT signing secret (64 bytes, base64 encoded)",
      value: generateSecret(64),
      bytes: 64,
    },
    {
      name: "SEED_ADMIN_PASSWORD",
      description: "Initial admin user password (32 bytes, base64 encoded)",
      value: generateSecret(32),
      bytes: 32,
    },
    {
      name: "SESSION_SECRET",
      description: "Session encryption secret (32 bytes, base64 encoded)",
      value: generateSecret(32),
      bytes: 32,
    },
  ];
}

function formatAsEnv(secrets: Secret[]): string {
  const lines = [
    "# Generated secrets for resume-ecosystem-node",
    `# Generated at: ${new Date().toISOString()}`,
    "# SECURITY: Store these securely and never commit to version control!",
    "",
  ];

  for (const secret of secrets) {
    lines.push(`# ${secret.description}`);
    lines.push(`${secret.name}=${secret.value}`);
    lines.push("");
  }

  return lines.join("\n");
}

function formatAsJson(secrets: Secret[]): string {
  const obj: Record<string, string> = {};
  for (const secret of secrets) {
    obj[secret.name] = secret.value;
  }
  return JSON.stringify(obj, null, 2);
}

function formatAsTable(secrets: Secret[]): string {
  const lines = [
    "",
    "=".repeat(80),
    "Generated Secrets for resume-ecosystem-node",
    "=".repeat(80),
    "",
    "SECURITY WARNING: Store these securely and never commit to version control!",
    "",
  ];

  for (const secret of secrets) {
    lines.push(`${secret.name}:`);
    lines.push(`  Description: ${secret.description}`);
    lines.push(`  Value: ${secret.value}`);
    lines.push("");
  }

  lines.push("=".repeat(80));
  lines.push("");
  lines.push("To use these secrets:");
  lines.push("  1. Copy .env.example to .env");
  lines.push("  2. Replace the placeholder values with the generated secrets above");
  lines.push("  3. For production, use a secrets manager (AWS Secrets Manager, Vault, etc.)");
  lines.push("");

  return lines.join("\n");
}

// Main execution
const args = process.argv.slice(2);
const secrets = generateSecrets();

if (args.includes("--env")) {
  console.log(formatAsEnv(secrets));
} else if (args.includes("--json")) {
  console.log(formatAsJson(secrets));
} else {
  console.log(formatAsTable(secrets));
}
