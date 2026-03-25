export interface EnvValidationOptions {
    /** Service name for error messages */
    serviceName?: string;
    /** Override NODE_ENV check (useful for testing) */
    forceProduction?: boolean;
    /** Skip validation entirely (NOT recommended) */
    skipValidation?: boolean;
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Validate that a JWT secret meets security requirements
 */
export declare function validateJwtSecret(secret: string | undefined): ValidationResult;
/**
 * Validate required environment variables for a service
 */
export declare function validateRequiredEnvVars(required: string[]): ValidationResult;
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
export declare function validateEnv(options?: EnvValidationOptions): void;
/**
 * Generate a cryptographically secure secret
 * Useful for setup scripts and documentation
 */
export declare function generateSecureSecret(bytes?: number): string;
export default validateEnv;
