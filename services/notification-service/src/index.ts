import { buildServer } from "./server.ts";
import { kafka } from "./kafka.js";
import { Topics } from "@common/index.js";
const PORT = Number(process.env.PORT || 4060);
const app = buildServer("notification-service", async () => {});
async function start() {
const consumer = kafka.consumer({ groupId: "notify-consumer" });
await consumer.connect();
await consumer.subscribe({ topic: Topics.ResumePublished, fromBeginning: true });
await consumer.run({ eachMessage: async ({ message }) => {
const evt = JSON.parse(message.value!.toString());
console.log("Notify: resume published", evt);
}});
app.listen({ port: PORT, host: "0.0.0.0" });
}
start();
