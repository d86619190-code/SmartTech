import nodemailer from "nodemailer";
import { config } from "../config.js";

function canSendEmail(): boolean {
  return Boolean(config.smtpHost && config.smtpUser && config.smtpPass && config.smtpFrom);
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  if (!canSendEmail()) {
    throw new Error("Email-провайдер не настроен (SMTP_*)");
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: { user: config.smtpUser, pass: config.smtpPass },
  });

  const ttlMin = Math.max(1, Math.round(config.otpTtlSec / 60));
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

  await transporter.sendMail({
    from: config.smtpFrom,
    to: email,
    subject: "Код подтверждения входа",
    text: `Ваш код входа: ${code}. Код действует ${ttlMin} мин.`,
    html,
  });
}
