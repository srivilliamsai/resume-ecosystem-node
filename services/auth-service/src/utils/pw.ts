import crypto from "crypto";

export async function hash(password: string): Promise<string> {
  if (!password) {
    throw new Error("Password is required");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return `${salt}:${digest}`;
}

export async function compare(password: string, stored?: string | null): Promise<boolean> {
  if (!password || !stored) {
    return false;
  }

  const [salt, digest] = stored.split(":");
  if (!salt || !digest) {
    return false;
  }

  const test = crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(test, "hex"));
}
