import crypto from "node:crypto";
import { config } from "../config.js";
import { withStore, type AppState } from "../store.js";
import { sha256Hex, timingEqual } from "./crypto.js";
import { sendOtpEmail } from "./email.js";
import { sendOtpSms } from "./sms.js";

const MAX_ATTEMPTS = 5;

function otpPepper(): string {
  return sha256Hex(`${config.jwtSecret}:otp`);
}

function hashOtp(key: string, code: string): string {
  return sha256Hex(`${otpPepper()}:${key}:${code}`);
}

function generateCode(): string {
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

function setOtp(s: AppState, key: string, codeHash: string, expiresAt: number): void {
  s.otp[key] = { code_hash: codeHash, expires_at: expiresAt, attempts: 0 };
}

export async function sendCode(key: string, channel: "phone" | "email"): Promise<void> {
  const code = generateCode();
  const codeHash = hashOtp(key, code);
  const expiresAt = Date.now() + config.otpTtlSec * 1000;

  await withStore((s) => {
    setOtp(s, key, codeHash, expiresAt);
  });

  if (channel === "phone") await sendOtpSms(key, code);
  if (channel === "email") await sendOtpEmail(key, code);
}

export async function verifyCode(phone: string, code: string): Promise<boolean> {
  return withStore((s) => {
    const row = s.otp[phone];
    if (!row) return false;
    if (Date.now() > row.expires_at) {
      delete s.otp[phone];
      return false;
    }
    if (row.attempts >= MAX_ATTEMPTS) {
      delete s.otp[phone];
      return false;
    }

    const ok = timingEqual(row.code_hash, hashOtp(phone, code));
    if (ok) {
      delete s.otp[phone];
      return true;
    }

    row.attempts += 1;
    return false;
  });
}
