import http from "http";
const MAP: Record<string, string> = {
"/auth": process.env.AUTH_URL || "http://localhost:4010",
"/activities": process.env.ACTIVITY_URL || "http://localhost:4020",
"/verify": process.env.VERIFY_URL || "http://localhost:4030",
"/resume": process.env.RESUME_URL || "http://localhost:4040",
"/webhooks": process.env.INTEGRATION_URL || "http://localhost:4050",
"/render": process.env.FILE_URL || "http://localhost:4070"
};
export function proxyRegister(app: any) {
for (const base in MAP) {
app.all(${base}/*, async (req: any, reply: any) => {
const target = MAP[base];
const path = req.raw.url?.replace(base, "") || "/";
const opts: http.RequestOptions = {
method: req.method,
headers: { ...req.headers, host: undefined },
};
const url = new URL(path, target);
const prox = http.request(url, opts, (res) => {
reply.code(res.statusCode || 502);
for (const [k, v] of Object.entries(res.headers)) reply.header(k, v as any);
res.pipe(reply.raw);
});
if (["POST","PUT","PATCH"].includes(req.method)) req.raw.pipe(prox); else prox.end();
});
}
}
