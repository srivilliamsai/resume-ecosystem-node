// common-lib/src/observability/metrics.ts
// Prometheus metrics collection for resume-ecosystem services
// Provides HTTP metrics, custom business metrics, and a /metrics endpoint
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from "prom-client";
/**
 * Metrics registry and collectors
 */
export class ServiceMetrics {
    constructor(options) {
        const { serviceName, prefix = "resume_", defaultMetrics = true, customLabels = {}, } = options;
        this.serviceName = serviceName;
        this.prefix = prefix;
        this.registry = new Registry();
        // Add default labels
        this.registry.setDefaultLabels({
            service: serviceName,
            ...customLabels,
        });
        // Collect default Node.js metrics (memory, CPU, event loop, etc.)
        if (defaultMetrics) {
            collectDefaultMetrics({
                register: this.registry,
                prefix: prefix,
            });
        }
        // HTTP request counter
        this.httpRequestsTotal = new Counter({
            name: `${prefix}http_requests_total`,
            help: "Total number of HTTP requests",
            labelNames: ["method", "path", "status_code"],
            registers: [this.registry],
        });
        // HTTP request duration histogram
        this.httpRequestDuration = new Histogram({
            name: `${prefix}http_request_duration_seconds`,
            help: "HTTP request duration in seconds",
            labelNames: ["method", "path", "status_code"],
            buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
            registers: [this.registry],
        });
        // HTTP requests in flight
        this.httpRequestsInFlight = new Gauge({
            name: `${prefix}http_requests_in_flight`,
            help: "Number of HTTP requests currently being processed",
            labelNames: ["method"],
            registers: [this.registry],
        });
        // Resume build metrics
        this.resumeBuildsTotal = new Counter({
            name: `${prefix}resume_builds_total`,
            help: "Total number of resume builds",
            labelNames: ["status", "template"],
            registers: [this.registry],
        });
        this.resumeBuildDuration = new Histogram({
            name: `${prefix}resume_build_duration_seconds`,
            help: "Resume build duration in seconds",
            labelNames: ["template"],
            buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
            registers: [this.registry],
        });
        // Activity metrics
        this.activitiesCreatedTotal = new Counter({
            name: `${prefix}activities_created_total`,
            help: "Total number of activities created",
            labelNames: ["type", "source"],
            registers: [this.registry],
        });
        // Verification metrics
        this.verificationsTotal = new Counter({
            name: `${prefix}verifications_total`,
            help: "Total number of verifications",
            labelNames: ["method", "status"],
            registers: [this.registry],
        });
        // Kafka metrics
        this.kafkaMessagesTotal = new Counter({
            name: `${prefix}kafka_messages_total`,
            help: "Total Kafka messages processed",
            labelNames: ["topic", "operation"],
            registers: [this.registry],
        });
        this.kafkaConsumerLag = new Gauge({
            name: `${prefix}kafka_consumer_lag`,
            help: "Kafka consumer lag (messages behind)",
            labelNames: ["topic", "partition", "groupId"],
            registers: [this.registry],
        });
        // Database connection gauge
        this.dbConnectionsActive = new Gauge({
            name: `${prefix}db_connections_active`,
            help: "Number of active database connections",
            registers: [this.registry],
        });
        // Cache hit ratio
        this.cacheHitRatio = new Gauge({
            name: `${prefix}cache_hit_ratio`,
            help: "Cache hit ratio (0-1)",
            labelNames: ["cache_name"],
            registers: [this.registry],
        });
    }
    /**
     * Get metrics in Prometheus format
     */
    async getMetrics() {
        return this.registry.metrics();
    }
    /**
     * Get metrics content type
     */
    getContentType() {
        return this.registry.contentType;
    }
    /**
     * Record HTTP request metrics
     */
    recordHttpRequest(method, path, statusCode, durationSeconds) {
        const normalizedPath = this.normalizePath(path);
        this.httpRequestsTotal.inc({
            method,
            path: normalizedPath,
            status_code: statusCode.toString(),
        });
        this.httpRequestDuration.observe({
            method,
            path: normalizedPath,
            status_code: statusCode.toString(),
        }, durationSeconds);
    }
    /**
     * Normalize paths to avoid high cardinality
     * /users/123 -> /users/:id
     */
    normalizePath(path) {
        return path
            .replace(/\/[a-f0-9-]{36}/gi, "/:uuid") // UUIDs
            .replace(/\/\d+/g, "/:id") // Numeric IDs
            .replace(/\/[a-z0-9]{24,}/gi, "/:id") // CUID/ObjectId
            .split("?")[0]; // Remove query string
    }
}
// Singleton instance per service
let metricsInstance = null;
/**
 * Initialize metrics for a service
 */
export function initMetrics(options) {
    if (metricsInstance) {
        return metricsInstance;
    }
    metricsInstance = new ServiceMetrics(options);
    return metricsInstance;
}
/**
 * Get the metrics instance
 */
export function getMetrics() {
    return metricsInstance;
}
/**
 * Fastify plugin to register metrics endpoint and request tracking
 *
 * @example
 * ```typescript
 * import Fastify from "fastify";
 * import { metricsPlugin } from "common-lib/observability/metrics";
 *
 * const app = Fastify();
 * await app.register(metricsPlugin, { serviceName: "auth-service" });
 * ```
 */
export async function metricsPlugin(fastify, options) {
    const metrics = initMetrics(options);
    // Register /metrics endpoint
    fastify.get("/metrics", async (request, reply) => {
        const metricsOutput = await metrics.getMetrics();
        reply.header("Content-Type", metrics.getContentType());
        return metricsOutput;
    });
    // Track request duration
    fastify.addHook("onRequest", async (request) => {
        request.startTime = process.hrtime.bigint();
        metrics.httpRequestsInFlight.inc({ method: request.method });
    });
    fastify.addHook("onResponse", async (request, reply) => {
        const startTime = request.startTime;
        if (startTime) {
            const duration = Number(process.hrtime.bigint() - startTime) / 1e9; // Convert to seconds
            metrics.recordHttpRequest(request.method, request.url, reply.statusCode, duration);
        }
        metrics.httpRequestsInFlight.dec({ method: request.method });
    });
    console.log(`[${options.serviceName}] Prometheus metrics available at /metrics`);
}
/**
 * Timer helper for measuring operation duration
 *
 * @example
 * ```typescript
 * const end = startTimer();
 * await doSomeWork();
 * const duration = end();
 * metrics.resumeBuildDuration.observe({ template: "modern" }, duration);
 * ```
 */
export function startTimer() {
    const start = process.hrtime.bigint();
    return () => Number(process.hrtime.bigint() - start) / 1e9;
}
export default ServiceMetrics;
