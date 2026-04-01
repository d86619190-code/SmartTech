import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "../config.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { phoneSchema } from "../services/phone.js";
import { sendCode, verifyCode } from "../services/otp.js";
import { signAccessToken, signStreamToken, type AccessPayload } from "../services/jwt.js";
import { getOrCreateUserByPhone, getOrCreateUserByGoogle, getOrCreateUserByEmail, findUserById, updateUserProfile } from "../services/user.js";
import { issueRefreshToken, revokeRefreshToken, rotateRefreshToken } from "../services/refreshToken.js";
import { verifyGoogleCredential } from "../services/google.js";
import type { UserRow } from "../store.js";

const sendCodeBody = z.object({ phone: phoneSchema });
const sendEmailCodeBody = z.object({ email: z.string().trim().email("Некорректный email") });
const verifyBody = z.object({
  phone: phoneSchema,
  code: z.string().regex(/^\d{6}$/, "Код из 6 цифр"),
  name: z.string().trim().min(2).max(60).optional(),
});
const verifyEmailBody = z.object({
  email: z.string().trim().email("Некорректный email"),
  code: z.string().regex(/^\d{6}$/, "Код из 6 цифр"),
  name: z.string().trim().min(2).max(60).optional(),
});
const refreshBody = z.object({
  refreshToken: z.string().min(10),
});
const logoutBody = z.object({ refreshToken: z.string().min(10).optional() });
const googleBody = z.object({ credential: z.string().min(10) });
const patchMeBody = z.object({
  name: z.string().trim().min(2).max(60),
  phone: phoneSchema.optional(),
  avatarUrl: z
    .string()
    .trim()
    .max(2_000_000)
    .refine((v) => /^https?:\/\//i.test(v) || /^data:image\//i.test(v), "Некорректный avatarUrl")
    .optional(),
});

const sendCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: "Слишком много запросов кода, попробуйте позже" },
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: "Слишком много попыток входа" },
});

const googleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: "Слишком много попыток входа через Google" },
});

function accessPayloadFromUser(user: UserRow): AccessPayload {
  return { sub: user.id, role: user.role, phone: user.phone, email: user.email };
}

function userPublic(user: UserRow) {
  return {
    id: user.id,
    createdAt: user.created_at,
    role: user.role,
    ...(user.name ? { name: user.name } : {}),
    ...(user.avatar_url ? { avatarUrl: user.avatar_url } : {}),
    ...(user.phone ? { phone: user.phone } : {}),
    ...(user.email ? { email: user.email } : {}),
  };
}

export const authRouter = Router();

authRouter.post("/phone/send-code", sendCodeLimiter, async (req, res) => {
  const parsed = sendCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  try {
    await sendCode(parsed.data.phone, "phone");
    res.status(200).json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка отправки кода";
    res.status(500).json({ error: msg });
  }
});

authRouter.post("/phone/verify", verifyLimiter, async (req, res) => {
  const parsed = verifyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const { phone, code } = parsed.data;
  if (!(await verifyCode(phone, code))) {
    res.status(401).json({ error: "Неверный или просроченный код" });
    return;
  }

  const user = await getOrCreateUserByPhone(phone);
  const namedUser =
    parsed.data.name && parsed.data.name.trim().length >= 2
      ? await updateUserProfile(user.id, { name: parsed.data.name.trim() })
      : user;
  const finalUser = namedUser ?? user;
  const accessToken = signAccessToken(accessPayloadFromUser(finalUser));
  const { token: refreshToken, expiresAt } = await issueRefreshToken(finalUser.id);

  res.status(200).json({
    user: userPublic(finalUser),
    accessToken,
    refreshToken,
    refreshExpiresAt: expiresAt,
  });
});

authRouter.post("/email/send-code", sendCodeLimiter, async (req, res) => {
  const parsed = sendEmailCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  try {
    await sendCode(email, "email");
    res.status(200).json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка отправки кода";
    res.status(500).json({ error: msg });
  }
});

authRouter.post("/email/verify", verifyLimiter, async (req, res) => {
  const parsed = verifyEmailBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  const { code } = parsed.data;
  if (!(await verifyCode(email, code))) {
    res.status(401).json({ error: "Неверный или просроченный код" });
    return;
  }
  const user = await getOrCreateUserByEmail(email);
  const namedUser =
    parsed.data.name && parsed.data.name.trim().length >= 2
      ? await updateUserProfile(user.id, { name: parsed.data.name.trim() })
      : user;
  const finalUser = namedUser ?? user;
  const accessToken = signAccessToken(accessPayloadFromUser(finalUser));
  const { token: refreshToken, expiresAt } = await issueRefreshToken(finalUser.id);
  res.status(200).json({
    user: userPublic(finalUser),
    accessToken,
    refreshToken,
    refreshExpiresAt: expiresAt,
  });
});

authRouter.post("/google", googleLimiter, async (req, res) => {
  if (!config.googleClientId) {
    res.status(503).json({ error: "Google OAuth не настроен (GOOGLE_CLIENT_ID)" });
    return;
  }
  const parsed = googleBody.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const issuePath = issue?.path?.join(".") || "body";
    const issueMsg = issue?.message || "Неверный формат запроса";
    res.status(400).json({
      error: `Некорректные данные: ${issuePath} (${issueMsg})`,
      details: parsed.error.flatten(),
    });
    return;
  }
  try {
    const profile = await verifyGoogleCredential(parsed.data.credential);
    const user = await getOrCreateUserByGoogle(profile.googleSub, profile.email, profile.name, profile.picture);
    const accessToken = signAccessToken(accessPayloadFromUser(user));
    const { token: refreshToken, expiresAt } = await issueRefreshToken(user.id);
    res.status(200).json({
      user: userPublic(user),
      accessToken,
      refreshToken,
      refreshExpiresAt: expiresAt,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка входа через Google";
    res.status(401).json({ error: msg });
  }
});

authRouter.post("/refresh", async (req, res) => {
  const parsed = refreshBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  const rotated = await rotateRefreshToken(parsed.data.refreshToken);
  if (!rotated) {
    res.status(401).json({ error: "Недействительный refresh-токен" });
    return;
  }
  const user = await findUserById(rotated.userId);
  if (!user) {
    res.status(401).json({ error: "Пользователь не найден" });
    return;
  }
  const accessToken = signAccessToken(accessPayloadFromUser(user));
  res.status(200).json({
    user: userPublic(user),
    accessToken,
    refreshToken: rotated.token,
    refreshExpiresAt: rotated.expiresAt,
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const uid = req.auth?.userId;
  if (!uid) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const user = await findUserById(uid);
  if (!user) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }
  res.status(200).json({ user: userPublic(user) });
});

authRouter.patch("/me", requireAuth, async (req, res) => {
  const uid = req.auth?.userId;
  if (!uid) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const parsed = patchMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  let updated: UserRow | undefined;
  try {
    updated = await updateUserProfile(uid, {
      name: parsed.data.name,
      phone: parsed.data.phone,
      avatarUrl: parsed.data.avatarUrl,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Не удалось обновить профиль";
    res.status(400).json({ error: msg });
    return;
  }
  if (!updated) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }
  res.status(200).json({ user: userPublic(updated) });
});

authRouter.post("/logout", async (req, res) => {
  const parsed = logoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Некорректные данные", details: parsed.error.flatten() });
    return;
  }
  if (parsed.data.refreshToken) {
    await revokeRefreshToken(parsed.data.refreshToken);
  }
  res.status(204).send();
});

authRouter.post("/stream-token", requireAuth, async (req, res) => {
  const uid = req.auth?.userId;
  const role = req.auth?.role;
  if (!uid || !role) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const token = signStreamToken({ sub: uid, role, kind: "sse" });
  res.status(200).json({ streamToken: token });
});
