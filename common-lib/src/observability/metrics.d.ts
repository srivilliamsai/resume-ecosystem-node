import { Registry, Counter, Histogram, Gauge } from "prom-client";
import { FastifyInstance } from "fastify";
/**
 * Metrics configuration options
 */
export interface MetricsOptions {
    /** Service name for metric labels */
    serviceName: string;
    /** Custom metric prefix (default: "resume_") */
    prefix?: string;
    /** Enable default Node.js metrics (default: true) */
    defaultMetrics?: boolean;
    /** Custom labels to add to all metrics */
    customLabels?: Record<string, string>;
}
/**
 * Metrics registry and collectors
 */
export declare class ServiceMetrics {
    readonly registry: Registry;
    readonly serviceName: string;
    private readonly prefix;
    readonly httpRequestsTotal: Counter;
    readonly httpRequestDuration: Histogram;
    readonly httpRequestsInFlight: Gauge;
    readonly resumeBuildsTotal: Counter;
    readonly resumeBuildDuration: Histogram;
    readonly activitiesCreatedTotal: Counter;
    readonly verificationsTotal: Counter;
    readonly kafkaMessagesTotal: Counter;
    readonly kafkaConsumerLag: Gauge;
    readonly dbConnectionsActive: Gauge;
    readonly cacheHitRatio: Gauge;
    constructor(options: MetricsOptions);
    /**
     * Get metrics in Prometheus format
     */
    getMetrics(): Promise<string>;
    /**
     * Get metrics content type
     */
    getContentType(): string;
    /**
     * Record HTTP request metrics
     */
    recordHttpRequest(method: string, path: string, statusCode: number, durationSeconds: number): void;
    /**
     * Normalize paths to avoid high cardinality
     * /users/123 -> /users/:id
     */
    private normalizePath;
}
/**
 * Initialize metrics for a service
 */
export declare function initMetrics(options: MetricsOptions): ServiceMetrics;
/**
 * Get the metrics instance
 */
export declare function getMetrics(): ServiceMetrics | null;
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
export declare function metricsPlugin(fastify: FastifyInstance, options: MetricsOptions): Promise<void>;
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
export declare function startTimer(): () => number;
export default ServiceMetrics;
