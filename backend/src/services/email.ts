import dns from "node:dns/promises";
import net from "node:net";
import nodemailer from "nodemailer";
import { config } from "../config.js";

function canSendEmail(): boolean {
  if (config.resendApiKey.trim()) return true;
  return Boolean(config.smtpHost && config.smtpUser && config.smtpPass && config.smtpFrom);
}

/** Облако без исходящего IPv6: подключение по A-записи + SNI для TLS. */
async function smtpIpv4Target(hostname: string): Promise<{ host: string; servername: string }> {
  try {
    const v4 = await dns.resolve4(hostname);
    if (v4.length > 0) return { host: v4[0], servername: hostname };
  } catch {
    // fallback
  }
  return { host: hostname, servername: hostname };
}

function buildOtpEmailContent(code: string): { subject: string; text: string; html: string } {
  const ttlMin = Math.max(1, Math.round(config.otpTtlSec / 60));
  const subject = "Код подтверждения входа";
  const text = `Ваш код входа: ${code}. Код действует ${ttlMin} мин.`;
  const html = `
  <div style="margin:0;padding:24px;background:#f1f5f9;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <tr>
        <td style="padding:20px 24px;background:linear-gradient(135deg,#0f172a,#1e293b);color:#f8fafc;">
          <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.75;">Авторизация</div>
          <h1 style="margin:8px 0 0;font-size:24px;line-height:1.15;">Код подтверждения</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 14px;font-size:15px;color:#334155;">Введите этот код на странице входа.</p>
          <div style="margin:0 0 16px;padding:14px 18px;border-radius:12px;border:1px solid #cbd5e1;background:#f8fafc;font-size:30px;font-weight:800;letter-spacing:.28em;text-align:center;color:#0f172a;">
            ${code}
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#475569;">Код действует <strong>${ttlMin} мин</strong> и используется один раз.</p>
          <p style="margin:0;font-size:13px;color:#64748b;">Если вы не запрашивали вход, просто проигнорируйте это письмо.</p>
        </td>
      </tr>
    </table>
  </div>`;
  return { subject, text, html };
}

async function sendViaResend(to: string, subject: string, text: string, html: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.resendFrom,
      to: [to],
      subject,
      html,
      text,
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? `Resend HTTP ${res.status}`);
  }
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  if (!canSendEmail()) {
    throw new Error("Почта не настроена: задайте RESEND_API_KEY или SMTP_*");
  }

  const { subject, text, html } = buildOtpEmailContent(code);

  if (config.resendApiKey.trim()) {
    await sendViaResend(email, subject, text, html);
    return;
  }

  const target = await smtpIpv4Target(config.smtpHost);
  const useIp = net.isIP(target.host) !== 0;

  const transporter = nodemailer.createTransport({
    host: target.host,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: { user: config.smtpUser, pass: config.smtpPass },
    connectionTimeout: 20_000,
    greetingTimeout: 15_000,
    socketTimeout: 35_000,
    allowInternalNetworkInterfaces: true,
    ...(useIp ? { tls: { servername: target.servername } } : {}),
  } as Parameters<typeof nodemailer.createTransport>[0]);

  try {
    await transporter.sendMail({
      from: config.smtpFrom,
      to: email,
      subject,
      text,
      html,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/timeout|ETIMEDOUT|ECONNRESET|ENETUNREACH|ECONNREFUSED/i.test(msg)) {
      throw new Error(
        "SMTP с сервера не доступен (Gmail с облака часто блокирует). В Railway → проект tech → сервис api → Variables добавьте RESEND_API_KEY=re_… с resend.com; при необходимости RESEND_FROM=onboarding@resend.dev. Либо SMTP SendGrid/Mailgun."
      );
    }
    throw e;
  }
}
