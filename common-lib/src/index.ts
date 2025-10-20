import crypto from "crypto";
export const Topics = {
ActivityCreated: "activity.created",
ActivityVerified: "activity.verified",
ResumePublished: "resume.version.published",
WebhookReceived: "integration.webhook.received"
} as const;
export type ActivityType = "INTERNSHIP" | "COURSE" | "HACKATHON" | "PROJECT";
export type ActivityStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type VerificationMethod = "WEBHOOK" | "OAUTH" | "HASH" | "OCR";
export function sha256Hex(input: string) {
return crypto.createHash("sha256").update(input).digest("hex");
}
export function tokenize(s: string) {
return (s || "")
.toLowerCase()
.match(/[a-z0-9]{3,}/g)?.filter(Boolean) ?? [];
}
export function jaccard(a: string, b: string) {
const A = new Set(tokenize(a));
const B = new Set(tokenize(b));
const inter = new Set([...A].filter((x) => B.has(x))).size;
const uni = new Set([...A, ...B]).size || 1;
return inter / uni;
}
export class Lru<K, V> {
private map = new Map<K, V>();
constructor(private readonly max = 1000) {}
get(k: K) {
if (!this.map.has(k)) return undefined;
const v = this.map.get(k)!;
this.map.delete(k);
this.map.set(k, v);
return v;
}
set(k: K, v: V) {
if (this.map.has(k)) this.map.delete(k);
this.map.set(k, v);
if (this.map.size > this.max) {
const first = this.map.keys().next().value;
this.map.delete(first);
}
}
}
export function rankScore(base: number, trust: number, impact: number, daysSinceEnd: number) {
const score = base * 0.5 + (trust / 100) * 0.3 + Math.log(1 + Math.max(0, impact)) * 0.2 + 5 * Math.exp(-(daysSinceEnd || 0) / 365);
return Math.round(score * 100) / 100;
}
export function topK<T>(arr: T[], k: number, key: (x: T) => number) {
return [...arr].sort((a, b) => key(b) - key(a)).slice(0, k);
}
export interface JwtUser { id: string; email: string; name?: string; roles: string[]; }
