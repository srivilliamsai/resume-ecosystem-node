export { validateEnv, validateJwtSecret, validateRequiredEnvVars, generateSecureSecret, type EnvValidationOptions, type ValidationResult, } from "./validateEnv.js";
export { createLogger, createChildLogger, createFastifyLoggerOptions, requestLoggingHook, responseLoggingHook, type LogLevel, type ServiceLoggerOptions, type LogContext, initTracing, shutdownTracing, getTracer, withSpan, getCurrentTraceContext, addSpanAttributes, recordSpanException, type TracingOptions, ServiceMetrics, initMetrics, getMetrics, metricsPlugin, startTimer, type MetricsOptions, } from "./observability/index.js";
export declare const Topics: {
    readonly ActivityCreated: "activity.created";
    readonly ActivityVerified: "activity.verified";
    readonly ResumePublished: "resume.version.published";
    readonly WebhookReceived: "integration.webhook.received";
};
export type ActivityType = "INTERNSHIP" | "COURSE" | "HACKATHON" | "PROJECT";
export type ActivityStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type VerificationMethod = "WEBHOOK" | "OAUTH" | "HASH" | "OCR";
export declare function sha256Hex(input: string): string;
export declare function tokenize(s: string): string[];
export declare function jaccard(a: string, b: string): number;
export declare class Lru<K, V> {
    private readonly max;
    private map;
    constructor(max?: number);
    get(k: K): NonNullable<V> | undefined;
    set(k: K, v: V): void;
}
export declare function rankScore(base: number, trust: number, impact: number, daysSinceEnd: number): number;
export declare function topK<T>(arr: T[], k: number, key: (x: T) => number): T[];
export interface JwtUser {
    id: string;
    email: string;
    name?: string;
    roles: string[];
}
