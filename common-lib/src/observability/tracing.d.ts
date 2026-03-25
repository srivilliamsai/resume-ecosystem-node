/**
 * Tracing configuration options
 */
export interface TracingOptions {
    /** Service name for trace identification */
    serviceName: string;
    /** Service version (default: from package.json) */
    serviceVersion?: string;
    /** OTLP exporter endpoint (default: from OTEL_EXPORTER_OTLP_ENDPOINT env or http://localhost:4318) */
    exporterEndpoint?: string;
    /** Enable debug logging for OpenTelemetry */
    debug?: boolean;
    /** Sample rate (0.0 to 1.0, default: 1.0 in dev, 0.1 in production) */
    sampleRate?: number;
    /** Custom resource attributes */
    resourceAttributes?: Record<string, string>;
}
/**
 * Initialize OpenTelemetry tracing
 * Call this at the very start of your application, before any other imports.
 *
 * @example
 * ```typescript
 * // At the very top of index.ts
 * import { initTracing } from "common-lib/observability/tracing";
 *
 * initTracing({ serviceName: "auth-service" });
 *
 * // Rest of imports...
 * ```
 */
export declare function initTracing(options: TracingOptions): void;
/**
 * Shutdown tracing gracefully
 */
export declare function shutdownTracing(): Promise<void>;
/**
 * Get the current tracer
 */
export declare function getTracer(name?: string): import("@opentelemetry/api").Tracer;
/**
 * Create a span for manual instrumentation
 *
 * @example
 * ```typescript
 * import { withSpan } from "common-lib/observability/tracing";
 *
 * const result = await withSpan("processPayment", async (span) => {
 *   span.setAttribute("payment.amount", amount);
 *   // ... do work
 *   return result;
 * });
 * ```
 */
export declare function withSpan<T>(name: string, fn: (span: any) => Promise<T>, attributes?: Record<string, string | number | boolean>): Promise<T>;
/**
 * Get current trace context for propagation
 */
export declare function getCurrentTraceContext(): {
    traceId?: string;
    spanId?: string;
};
/**
 * Add attributes to the current span
 */
export declare function addSpanAttributes(attributes: Record<string, string | number | boolean>): void;
/**
 * Record an exception on the current span
 */
export declare function recordSpanException(error: Error): void;
export default initTracing;
