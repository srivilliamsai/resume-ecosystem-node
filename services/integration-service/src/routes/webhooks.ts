import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { producer } from "@resume/services/kafka";
import { Topics } from "common-lib";

type Source = "github" | "hackathon" | "course";

const ALLOWED_SOURCES: ReadonlySet<Source> = new Set<Source>(["github", "hackathon", "course"]);

type WebhookParams = {
  source: string;
};

type WebhookRequest = FastifyRequest<{ Params: WebhookParams; Body: unknown }>;

function isAllowedSource(value: string): value is Source {
  return ALLOWED_SOURCES.has(value as Source);
}

export async function routes(app: FastifyInstance): Promise<void> {
  app.post("/webhooks/:source", async (req: WebhookRequest, reply: FastifyReply) => {
    const sourceCandidate = req.params.source.toLowerCase();

    if (!isAllowedSource(sourceCandidate)) {
      return reply.code(404).send({ error: "Unsupported webhook source" });
    }

    await producer.send({
      topic: Topics.WebhookReceived,
      messages: [
        {
          value: JSON.stringify({ source: sourceCandidate, receivedAt: new Date().toISOString(), payload: req.body })
        }
      ]
    });

    return reply.code(202).send({ accepted: true });
  });
}
