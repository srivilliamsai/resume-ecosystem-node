// common-lib/src/validateEnv.ts
// Environment validation utility for resume-ecosystem-node
// Import this at the TOP of each service's main entry point (before any other imports)
/**
 * List of known weak/default secrets that should never be used in production
 */
const WEAK_SECRETS = new Set([
    'supersecretkey',
    'devsecret',
    'secret',
    'password',
    'changeme',
    'change_me',
    'CHANGE_ME_GENERATE_WITH_openssl_rand_base64_64',
    'your-secret-here',
    'jwt-secret',
    'development-secret',
    'test-secret',
    'example-secret',
    '12345678',
    'qwerty',
    'asdf1234',
]);
/**
 * Minimum requirements for a secure JWT secret
 */
const MIN_SECRET_LENGTH = 32;
const MIN_ENTROPY_CHARS = 10; // Minimum unique characters
/**
 * Calculate basic entropy score based on character diversity
 */
function calculateEntropyScore(secret) {
    const uniqueChars = new Set(secret.split('')).size;
    const hasLower = /[a-z]/.test(secret);
    const hasUpper = /[A-Z]/.test(secret);
    const hasDigit = /[0-9]/.test(secret);
    const hasSpecial = /[^a-zA-Z0-9]/.test(secret);
    let score = uniqueChars;
    if (hasLower)
        score += 5;
    if (hasUpper)
        score += 5;
    if (hasDigit)
        score += 5;
    if (hasSpecial)
        score += 10;
    return score;
}
/**
 * Validate that a JWT secret meets security requirements
 */
export function validateJwtSecret(secret) {
    const errors = [];
    const warnings = [];
    if (!secret) {
        errors.push('JWT_SECRET is not set');
        return { valid: false, errors, warnings };
    }
    // Check against known weak secrets (case-insensitive)
    if (WEAK_SECRETS.has(secret.toLowerCase())) {
        errors.push(`JWT_SECRET is a known weak/default value ("${secret.slice(0, 10)}..."). ` +
            'Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'base64\'))"');
    }
    // Check minimum length
    if (secret.length < MIN_SECRET_LENGTH) {
        errors.push(`JWT_SECRET is too short (${secret.length} chars). ` +
            `Minimum required: ${MIN_SECRET_LENGTH} characters`);
    }
    // Check character diversity
    const uniqueChars = new Set(secret.split('')).size;
    if (uniqueChars < MIN_ENTROPY_CHARS) {
        errors.push(`JWT_SECRET has low entropy (only ${uniqueChars} unique characters). ` +
            'Use a randomly generated secret with high character diversity');
    }
    // Warnings for suboptimal but acceptable secrets
    const entropyScore = calculateEntropyScore(secret);
    if (errors.length === 0 && entropyScore < 30) {
        warnings.push('JWT_SECRET entropy is acceptable but could be improved. ' +
            'Consider using a base64-encoded random string for better security');
    }
    return { valid: errors.length === 0, errors, warnings };
}
/**
 * Validate required environment variables for a service
 */
export function validateRequiredEnvVars(required) {
    const errors = [];
    const warnings = [];
    for (const varName of required) {
        const value = process.env[varName];
        if (!value || value.trim() === '') {
            errors.push(`Required environment variable ${varName} is not set`);
        }
    }
    return { valid: errors.length === 0, errors, warnings };
}
/**
 * Main validation function — call this at service startup
 *
 * @example
 * ```typescript
 * // At the very top of your service's index.ts
 * import { validateEnv } from '@resume-ecosystem/common-lib';
 * validateEnv({ serviceName: 'auth-service' });
 *
 * // Rest of your imports and code...
 * ```
 */
export function validateEnv(options = {}) {
    const { serviceName = 'service', forceProduction = false, skipValidation = false, } = options;
    if (skipValidation) {
        console.warn(`[${serviceName}] WARNING: Environment validation is disabled. ` +
            'This is NOT recommended for production use.');
        return;
    }
    const isProduction = forceProduction || process.env.NODE_ENV === 'production';
    const errors = [];
    const warnings = [];
    // Validate JWT_SECRET
    const jwtResult = validateJwtSecret(process.env.JWT_SECRET);
    if (isProduction) {
        // In production, all issues are errors
        errors.push(...jwtResult.errors);
        errors.push(...jwtResult.warnings.map(w => w.replace('could be improved', 'must be improved')));
    }
    else {
        // In development, security issues are warnings (except missing secret)
        if (!process.env.JWT_SECRET) {
            errors.push(...jwtResult.errors);
        }
        else {
            warnings.push(...jwtResult.errors);
            warnings.push(...jwtResult.warnings);
        }
    }
    // Print warnings
    for (const warning of warnings) {
        console.warn(`[${serviceName}] ENV WARNING: ${warning}`);
    }
    // Handle errors
    if (errors.length > 0) {
        const errorMessage = [
            `\n${'='.repeat(70)}`,
            `[${serviceName}] FATAL: Environment validation failed`,
            `${'='.repeat(70)}`,
            '',
            ...errors.map((e, i) => `  ${i + 1}. ${e}`),
            '',
            'To fix this:',
            '  1. Copy .env.example to .env',
            '  2. Generate a secure JWT_SECRET:',
            '     node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'base64\'))"',
            '  3. Set NODE_ENV=development for local development (validation is relaxed)',
            '',
            `${'='.repeat(70)}\n`,
        ].join('\n');
        console.error(errorMessage);
        if (isProduction) {
            process.exit(1);
        }
    }
    if (errors.length === 0 && warnings.length === 0) {
        console.log(`[${serviceName}] Environment validation passed`);
    }
}
/**
 * Generate a cryptographically secure secret
 * Useful for setup scripts and documentation
 */
export function generateSecureSecret(bytes = 64) {
    // Dynamic import to avoid issues in browser environments
    const crypto = require('crypto');
    return crypto.randomBytes(bytes).toString('base64');
}
export default validateEnv;
