import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { prisma } from "@resume/services/prisma";
import { sign, verify } from "../utils/jwt.js";
import { hash, compare } from "../utils/pw.js";

type RegisterBody = {
  email?: string;
  name?: string;
  password?: string;
};

type TokenBody = {
  email?: string;
  password?: string;
};

export async function routes(app: FastifyInstance): Promise<void> {
  app.post("/auth/register", async (req: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    const { email, name, password } = req.body ?? {};

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return reply.code(400).send({ error: "Valid email is required" });
    }

    if (!password || password.length < 8) {
      return reply.code(400).send({ error: "Password must be at least 8 characters" });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return reply.code(409).send({ error: "User already exists" });
    }

    const hashed = await hash(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name?.trim() ?? null,
        password: hashed,
        roles: ["USER"]
      }
    });

    return reply.code(201).send({ id: user.id, email: user.email, name: user.name });
  });

  app.post("/auth/token", async (req: FastifyRequest<{ Body: TokenBody }>, reply: FastifyReply) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return reply.code(400).send({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.password || !(await compare(password, user.password))) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const token = await sign({ sub: user.id, email: user.email, roles: user.roles, name: user.name ?? undefined });

    return reply.send({
      token,
      user: { id: user.id, email: user.email, name: user.name, roles: user.roles }
    });
  });

  app.get("/auth/me", async (req: FastifyRequest, reply: FastifyReply) => {
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      return reply.code(401).send({ error: "Authorization token missing" });
    }

    try {
      const payload = await verify(token);
      return reply.send(payload);
    } catch {
      return reply.code(401).send({ error: "Invalid token" });
    }
  });
}
