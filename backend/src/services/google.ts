import { OAuth2Client } from "google-auth-library";
import { config } from "../config.js";

export type GoogleProfile = { googleSub: string; email: string; name?: string; picture?: string };

let client: OAuth2Client | null = null;

function getClient(): OAuth2Client {
  if (!config.googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID не задан");
  }
  if (!client) {
    client = new OAuth2Client(config.googleClientId);
  }
  return client;
}

export async function verifyGoogleCredential(credential: string): Promise<GoogleProfile> {
  const c = getClient();
  const ticket = await c.verifyIdToken({
    idToken: credential,
    audience: config.googleClientId,
  });
  const p = ticket.getPayload();
  if (!p?.sub || !p.email) {
    throw new Error("Некорректный ответ Google");
  }
  return {
    googleSub: p.sub,
    email: p.email,
    name: p.name,
    picture: p.picture,
  };
}
