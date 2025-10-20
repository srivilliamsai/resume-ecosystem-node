import crypto from "crypto";
export async function hash(pw: string) {
const salt = crypto.randomBytes(8).toString("hex");
return salt + ":" + crypto.pbkdf2Sync(pw, salt, 10000, 32, "sha256").toString("hex");
}
export async function compare(pw: string, stored: string) {
const [salt, h] = stored.split(":");
const test = crypto.pbkdf2Sync(pw, salt, 10000, 32, "sha256").toString("hex");
return h === test;
}
