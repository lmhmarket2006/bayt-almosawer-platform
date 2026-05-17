import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE_NAME = "bayt_almosawer_session";

export type AppRole = "ADMIN" | "STUDENT" | "INSTRUCTOR";

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
};

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is missing in .env file");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    return {
      userId: payload.userId as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as AppRole,
    };
  } catch {
    return null;
  }
}