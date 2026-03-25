import { Logger, LoggerOptions } from "pino";
/**
 * Log levels supported by the logger
 */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
/**
 * Options for creating a service logger
 */
export interface ServiceLoggerOptions {
    /** Service name (e.g., "auth-service") */
    serviceName: string;
    /** Log level (default: from LOG_LEVEL env or "info") */
    level?: LogLevel;
    /** Enable pretty printing for development (default: auto-detect) */
    pretty?: boolean;
    /** Additional base context to include in all logs */
    baseContext?: Record<string, unknown>;
}
/**
 * Standard log context fields
 */
export interface LogContext {
    /** Correlation ID for request tracing */
    correlationId?: string;
    /** User ID if authenticated */
    userId?: string;
    /** Request ID */
    requestId?: string;
    /** Span ID for distributed tracing */
    spanId?: string;
    /** Trace ID for distributed tracing */
    traceId?: string;
    /** Additional context */
    [key: string]: unknown;
}
/**
 * Create a logger instance for a service
 *
 * @example
 * ```typescript
 * import { createLogger } from "common-lib";
 *
 * const logger = createLogger({ serviceName: "auth-service" });
 *
 * logger.info({ userId: "123" }, "User logged in");
 * logger.error({ error: err }, "Failed to process request");
 * ```
 */
export declare function createLogger(options: ServiceLoggerOptions): Logger;
/**
 * Create a child logger with additional context
 */
export declare function createChildLogger(parent: Logger, context: LogContext): Logger;
/**
 * Create Fastify logger options
 * Use this when configuring Fastify's built-in logger
 *
 * @example
 * ```typescript
 * const app = Fastify({
 *   logger: createFastifyLoggerOptions({ serviceName: "auth-service" }),
 * });
 * ```
 */
export declare function createFastifyLoggerOptions(options: ServiceLoggerOptions): LoggerOptions | boolean;
/**
 * Request logging hook for Fastify
 * Logs request/response with timing and correlation IDs
 */
export declare function requestLoggingHook(logger: Logger): (request: any, reply: any) => Promise<void>;
/**
 * Response logging hook for Fastify
 */
export declare function responseLoggingHook(): (request: any, reply: any) => Promise<void>;
export default createLogger;
