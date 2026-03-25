import crypto from "crypto";
// Re-export environment validation utilities
export { validateEnv, validateJwtSecret, validateRequiredEnvVars, generateSecureSecret, } from "./validateEnv.js";
// Re-export observability utilities
export { 
// Logger
createLogger, createChildLogger, createFastifyLoggerOptions, requestLoggingHook, responseLoggingHook, 
// Tracing
initTracing, shutdownTracing, getTracer, withSpan, getCurrentTraceContext, addSpanAttributes, recordSpanException, 
// Metrics
ServiceMetrics, initMetrics, getMetrics, metricsPlugin, startTimer, } from "./observability/index.js";
export const Topics = {
    ActivityCreated: "activity.created",
    ActivityVerified: "activity.verified",
    ResumePublished: "resume.version.published",
    WebhookReceived: "integration.webhook.received"
};
export function sha256Hex(input) {
    return crypto.createHash("sha256").update(input).digest("hex");
}
export function tokenize(s) {
    return (s || "")
        .toLowerCase()
        .match(/[a-z0-9]{3,}/g)?.filter(Boolean) ?? [];
}
export function jaccard(a, b) {
    const A = new Set(tokenize(a));
    const B = new Set(tokenize(b));
    const inter = new Set([...A].filter((x) => B.has(x))).size;
    const uni = new Set([...A, ...B]).size || 1;
    return inter / uni;
}
export class Lru {
    constructor(max = 1000) {
        this.max = max;
        this.map = new Map();
    }
    get(k) {
        if (!this.map.has(k))
            return undefined;
        const v = this.map.get(k);
        this.map.delete(k);
        this.map.set(k, v);
        return v;
    }
    set(k, v) {
        if (this.map.has(k))
            this.map.delete(k);
        this.map.set(k, v);
        if (this.map.size > this.max) {
            const first = this.map.keys().next().value;
            if (first !== undefined)
                this.map.delete(first);
        }
    }
}
export function rankScore(base, trust, impact, daysSinceEnd) {
    const score = base * 0.5 + (trust / 100) * 0.3 + Math.log(1 + Math.max(0, impact)) * 0.2 + 5 * Math.exp(-(daysSinceEnd || 0) / 365);
    return Math.round(score * 100) / 100;
}
export function topK(arr, k, key) {
    return [...arr].sort((a, b) => key(b) - key(a)).slice(0, k);
}
