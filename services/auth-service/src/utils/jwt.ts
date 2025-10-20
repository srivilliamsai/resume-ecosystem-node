import * as jose from "jose";
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "devsecret");
export async function sign(payload: any)
{
return await new jose.SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("2h").sign(secret);
}
export async function verify(token: string) {
const { payload } = await jose.jwtVerify(token, secret);
return payload;
}
