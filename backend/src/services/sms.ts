import { config } from "../config.js";

/** Заглушка под SMS-провайдера (Twilio и т.д.). В dev логируем в консоль. */
export async function sendOtpSms(phone: string, code: string): Promise<void> {
  if (config.nodeEnv !== "production") {
    console.info(`[sms:dev] OTP для ${phone}: ${code}`);
    return;
  }
  // Until SMS provider integration is added, do not break auth flow.
  console.warn(`[sms:stub] SMS provider is not configured. OTP for ${phone}: ${code}`);
}
