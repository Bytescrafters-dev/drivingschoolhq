/*
 * Sri Lankan phone numbers. The backend accepts `0812223333`, `812223333` and
 * `+94812223333` and always returns `+94812223333`.
 */

const LK_PHONE = /^(?:\+94|0)?(\d{9})$/;

/** Returns "+94XXXXXXXXX", or `null` when the input isn't a Sri Lankan number. */
export const normalizeLkPhone = (input: string): string | null => {
  const compact = input.replace(/[\s\-()]/g, "");
  const match = LK_PHONE.exec(compact);
  return match ? `+94${match[1]}` : null;
};

/** "+94812223333" → "0812223333" (for editing). */
export const toLocalPhone = (phone: string): string => {
  const normalized = normalizeLkPhone(phone);
  return normalized ? `0${normalized.slice(3)}` : phone;
};

/** "+94812223333" → "081 222 3333". Falls back to the raw value. */
export const formatLkPhone = (phone: string): string => {
  const normalized = normalizeLkPhone(phone);
  if (!normalized) return phone;
  const local = `0${normalized.slice(3)}`;
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
};
