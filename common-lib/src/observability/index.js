// common-lib/src/observability/index.ts
// Barrel export for all observability utilities
export { createLogger, createChildLogger, createFastifyLoggerOptions, requestLoggingHook, responseLoggingHook, } from "./logger.js";
export { initTracing, shutdownTracing, getTracer, withSpan, getCurrentTraceContext, addSpanAttributes, recordSpanException, } from "./tracing.js";
export { ServiceMetrics, initMetrics, getMetrics, metricsPlugin, startTimer, } from "./metrics.js";
