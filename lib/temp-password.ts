// No look-alikes (0/O, 1/l/I) since the password is read out or copied by hand.
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const ALL = UPPER + LOWER + DIGITS;

/** Uniform random index in [0, max) without modulo bias. */
const randomIndex = (max: number): number => {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % max;
};

const pick = (chars: string) => chars[randomIndex(chars.length)];

/**
 * Temporary password for a staff member (12–128 chars required by the API).
 * Always contains an upper-case letter, a lower-case letter and a digit.
 */
export const generateTemporaryPassword = (length = 16): string => {
  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS)];
  while (chars.length < length) chars.push(pick(ALL));
  // Fisher–Yates so the guaranteed classes aren't always first.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};
