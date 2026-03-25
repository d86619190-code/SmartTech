import { z } from "zod";

/** Нормализация российского номера в E.164 (+7XXXXXXXXXX). */
export function normalizePhone(input: string): string | null {
  const raw = input.trim().replace(/[\s()-]/g, "");
  if (!raw) return null;

  let digits = raw;
  if (digits.startsWith("+")) digits = digits.slice(1);

  if (digits.startsWith("8") && digits.length === 11) {
    digits = "7" + digits.slice(1);
  }

  if (digits.startsWith("7") && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.length === 10 && /^9\d{9}$/.test(digits)) {
    return `+7${digits}`;
  }

  // Fallback for international formats in web/mobile forms.
  if (/^\d{10,15}$/.test(digits)) {
    return `+${digits}`;
  }

  return null;
}

export const phoneSchema = z
  .string()
  .min(8)
  .refine((s) => normalizePhone(s) !== null, { message: "Некорректный номер телефона" })
  .transform((s) => normalizePhone(s)!);
