import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function parseOrigins(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBossEmails(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  jwtSecret: required("JWT_SECRET", "dev-only-change-me-in-production"),
  jwtAccessTtlSec: Number(process.env.JWT_ACCESS_TTL_SEC ?? 900),
  refreshTtlDays: Number(process.env.REFRESH_TTL_DAYS ?? 30),
  otpTtlSec: Number(process.env.OTP_TTL_SEC ?? 300),
  otpDevPlaintext: process.env.OTP_DEV_PLAINTEXT === "1",
  corsOrigins: parseOrigins(
    process.env.CORS_ORIGIN ??
      "http://localhost:5173,http://127.0.0.1:5173,http://localhost,http://127.0.0.1,capacitor://localhost,ionic://localhost"
  ),
  dbPath: process.env.DB_PATH ?? "./data/app.json",
  /** OAuth 2.0 Client ID (Web) — тот же, что на фронте для Google Identity Services */
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  bossEmails: parseBossEmails(process.env.BOSS_EMAILS ?? "98y7tbnb@gmail.com,shostak-aleshka@mail.ru"),
};
