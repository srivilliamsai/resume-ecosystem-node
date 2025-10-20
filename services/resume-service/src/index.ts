import { buildServer } from "./server.ts";
import { routes } from "./routes/resume.js";
import { kafka, producer } from "./kafka.js";
import { Topics } from "@common/index.js";
import { rebuildForUser } from "./services/rebuilder.js";
const PORT = Number(process.env.PORT || 4040);
const app = buildServer("resume-service", routes);
async function start() {
await producer.connect();
const consumer = kafka.consumer({ groupId: "resume-consumer" });
await consumer.connect();
await consumer.subscribe({ topic: Topics.ActivityVerified, fromBeginning: true });
await consumer.run({
eachMessage: async ({ message }) => {
const { userId, status } = JSON.parse(message.value!.toString());
if (status === "OK") {
const { version } = await rebuildForUser(userId);
await producer.send({ topic: Topics.ResumePublished, messages: [{ key: userId, value: JSON.stringify({ userId, resumeVersionId: version.id }) }] });
}
}
});
app.listen({ port: PORT, host: "0.0.0.0" });
}
start();
