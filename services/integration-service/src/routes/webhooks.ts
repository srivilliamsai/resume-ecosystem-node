import { producer } from "../kafka.js";
import { Topics } from "@common/index.js";
export async function routes(app: any) {
app.post("/webhooks/github", async (req: any) => {
// normalize to PROJECT
await producer.send({ topic: Topics.WebhookReceived, messages: [{ value: JSON.stringify({ source: "github", payload: req.body }) }] });
return { ok: true };
});
app.post("/webhooks/hackathon", async (req: any) => {
await producer.send({ topic: Topics.WebhookReceived, messages: [{ value: JSON.stringify({ source: "hackathon", payload: req.body }) }] });
return { ok: true };
});
app.post("/webhooks/course", async (req: any) => {
await producer.send({ topic: Topics.WebhookReceived, messages: [{ value: JSON.stringify({ source: "course", payload: req.body }) }] });
return { ok: true };
});
}
