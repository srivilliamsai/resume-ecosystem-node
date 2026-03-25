// common-lib/src/observability/tracing.ts
// OpenTelemetry distributed tracing configuration
// IMPORTANT: Import this file at the VERY TOP of your service's entry point,
// BEFORE any other imports, to ensure proper instrumentation.
//
// Example usage:
// ```typescript
// // index.ts - MUST BE FIRST IMPORT
// import { initTracing } from "common-lib/observability/tracing";
// initTracing({ serviceName: "auth-service" });
//
// // Now import everything else
// import { buildServer } from "./server.js";
// ```
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT, } from "@opentelemetry/semantic-conventions";
import { BatchSpanProcessor, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { diag, DiagConsoleLogger, DiagLogLevel, trace, SpanStatusCode } from "@opentelemetry/api";
let sdk = null;
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
export function initTracing(options) {
    const { serviceName, serviceVersion = process.env.npm_package_version || "1.0.0", exporterEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318", debug = false, sampleRate = process.env.NODE_ENV === "production" ? 0.1 : 1.0, resourceAttributes = {}, } = options;
    // Check if tracing is enabled
    const isEnabled = process.env.OTEL_ENABLED === "true" || process.env.NODE_ENV === "production";
    if (!isEnabled) {
        console.log(`[${serviceName}] OpenTelemetry tracing disabled (set OTEL_ENABLED=true to enable)`);
        return;
    }
    // Enable debug logging if requested
    if (debug) {
        diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    }
    // Create resource with service information
    const resource = new Resource({
        [SEMRESATTRS_SERVICE_NAME]: serviceName,
        [SEMRESATTRS_SERVICE_VERSION]: serviceVersion,
        [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "development",
        ...resourceAttributes,
    });
    // Create OTLP exporter for sending traces to Jaeger/collector
    const traceExporter = new OTLPTraceExporter({
        url: `${exporterEndpoint}/v1/traces`,
    });
    // Choose span processor based on environment
    const spanProcessor = process.env.NODE_ENV === "production"
        ? new BatchSpanProcessor(traceExporter, {
            maxQueueSize: 2048,
            maxExportBatchSize: 512,
            scheduledDelayMillis: 5000,
        })
        : new SimpleSpanProcessor(traceExporter);
    // Initialize the SDK
    sdk = new NodeSDK({
        resource,
        spanProcessors: [spanProcessor],
        textMapPropagator: new W3CTraceContextPropagator(),
        instrumentations: [
            getNodeAutoInstrumentations({
                // Disable some noisy instrumentations
                "@opentelemetry/instrumentation-fs": {
                    enabled: false,
                },
                "@opentelemetry/instrumentation-dns": {
                    enabled: false,
                },
                // Configure HTTP instrumentation
                "@opentelemetry/instrumentation-http": {
                    ignoreIncomingPaths: ["/health", "/ready", "/metrics"],
                },
                // Configure Fastify instrumentation
                "@opentelemetry/instrumentation-fastify": {
                    enabled: true,
                },
                // Configure PostgreSQL instrumentation
                "@opentelemetry/instrumentation-pg": {
                    enabled: true,
                },
                // Configure Redis instrumentation
                "@opentelemetry/instrumentation-redis-4": {
                    enabled: true,
                },
            }),
        ],
    });
    // Start the SDK
    sdk.start();
    console.log(`[${serviceName}] OpenTelemetry tracing initialized`);
    console.log(`[${serviceName}] Exporting traces to: ${exporterEndpoint}`);
    // Graceful shutdown
    process.on("SIGTERM", () => {
        sdk
            ?.shutdown()
            .then(() => console.log(`[${serviceName}] OpenTelemetry shut down`))
            .catch((err) => console.error(`[${serviceName}] OpenTelemetry shutdown error:`, err));
    });
}
/**
 * Shutdown tracing gracefully
 */
export async function shutdownTracing() {
    if (sdk) {
        await sdk.shutdown();
        sdk = null;
    }
}
/**
 * Get the current tracer
 */
export function getTracer(name) {
    return trace.getTracer(name || "default");
}
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
export async function withSpan(name, fn, attributes) {
    const tracer = getTracer();
    return tracer.startActiveSpan(name, async (span) => {
        try {
            if (attributes) {
                Object.entries(attributes).forEach(([key, value]) => {
                    span.setAttribute(key, value);
                });
            }
            const result = await fn(span);
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
        }
        catch (error) {
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error instanceof Error ? error.message : "Unknown error",
            });
            span.recordException(error);
            throw error;
        }
        finally {
            span.end();
        }
    });
}
/**
 * Get current trace context for propagation
 */
export function getCurrentTraceContext() {
    const span = trace.getActiveSpan();
    if (!span)
        return {};
    const spanContext = span.spanContext();
    return {
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
    };
}
/**
 * Add attributes to the current span
 */
export function addSpanAttributes(attributes) {
    const span = trace.getActiveSpan();
    if (span) {
        Object.entries(attributes).forEach(([key, value]) => {
            span.setAttribute(key, value);
        });
    }
}
/**
 * Record an exception on the current span
 */
export function recordSpanException(error) {
    const span = trace.getActiveSpan();
    if (span) {
        span.recordException(error);
        span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
        });
    }
}
export default initTracing;
