// common-lib/src/observability/logger.ts
// Structured JSON logging configuration using Pino
// Provides consistent logging across all microservices
import pino from "pino";
/**
 * Redact sensitive fields from logs
 */
const REDACT_PATHS = [
    "password",
    "token",
    "authorization",
    "cookie",
    "secret",
    "apiKey",
    "api_key",
    "accessToken",
    "access_token",
    "refreshToken",
    "refresh_token",
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers.set-cookie",
];
/**
 * Create base Pino options for a service
 */
function createBaseOptions(options) {
    const { serviceName, level = process.env.LOG_LEVEL || "info", baseContext = {}, } = options;
    const isProduction = process.env.NODE_ENV === "production";
    const isTest = process.env.NODE_ENV === "test";
    return {
        level: isTest ? "silent" : level,
        base: {
            service: serviceName,
            env: process.env.NODE_ENV || "development",
            version: process.env.npm_package_version || "unknown",
            ...baseContext,
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
            level: (label) => ({ level: label }),
            bindings: (bindings) => ({
                pid: bindings.pid,
                host: bindings.hostname,
            }),
        },
        redact: {
            paths: REDACT_PATHS,
            censor: "[REDACTED]",
        },
        // Serializers for common objects
        serializers: {
            err: pino.stdSerializers.err,
            error: pino.stdSerializers.err,
            req: (req) => ({
                method: req.method,
                url: req.url,
                path: req.path || req.url?.split("?")[0],
                query: req.query,
                params: req.params,
                headers: {
                    host: req.headers?.host,
                    "user-agent": req.headers?.["user-agent"],
                    "content-type": req.headers?.["content-type"],
                    "x-request-id": req.headers?.["x-request-id"],
                    "x-correlation-id": req.headers?.["x-correlation-id"],
                },
            }),
            res: (res) => ({
                statusCode: res.statusCode,
                headers: {
                    "content-type": res.getHeader?.("content-type"),
                    "content-length": res.getHeader?.("content-length"),
                },
            }),
        },
        // Message key for log message
        messageKey: "msg",
        // Error key
        errorKey: "error",
        // Nested key for additional context
        nestedKey: "context",
    };
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
export function createLogger(options) {
    const baseOptions = createBaseOptions(options);
    const { pretty = process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test" } = options;
    if (pretty) {
        // Use pino-pretty for development
        return pino({
            ...baseOptions,
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                    singleLine: false,
                },
            },
        });
    }
    // JSON output for production
    return pino(baseOptions);
}
/**
 * Create a child logger with additional context
 */
export function createChildLogger(parent, context) {
    return parent.child(context);
}
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
export function createFastifyLoggerOptions(options) {
    if (process.env.NODE_ENV === "test") {
        return false;
    }
    const baseOptions = createBaseOptions(options);
    const { pretty = process.env.NODE_ENV !== "production" } = options;
    if (pretty) {
        return {
            ...baseOptions,
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                },
            },
        };
    }
    return baseOptions;
}
/**
 * Request logging hook for Fastify
 * Logs request/response with timing and correlation IDs
 */
export function requestLoggingHook(logger) {
    return async function onRequest(request, reply) {
        const correlationId = request.headers["x-correlation-id"] ||
            request.headers["x-request-id"] ||
            generateId();
        // Add correlation ID to request for downstream use
        request.correlationId = correlationId;
        // Add correlation ID to response headers
        reply.header("x-correlation-id", correlationId);
        // Create child logger with request context
        request.log = logger.child({
            correlationId,
            requestId: request.id,
            method: request.method,
            url: request.url,
        });
        request.log.info("Request started");
    };
}
/**
 * Response logging hook for Fastify
 */
export function responseLoggingHook() {
    return async function onResponse(request, reply) {
        const duration = reply.elapsedTime || 0;
        request.log.info({
            statusCode: reply.statusCode,
            durationMs: Math.round(duration * 100) / 100,
        }, "Request completed");
    };
}
/**
 * Generate a simple unique ID
 */
function generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}
export default createLogger;
