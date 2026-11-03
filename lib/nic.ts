/*
 * Sri Lankan NIC: old format (9 digits + V/X) or new format (12 digits).
 * Stored upper-case by the backend.
 */
const NIC = /^(?:\d{9}[VX]|\d{12})$/;

/** Returns the upper-cased NIC, or `null` when the format is invalid. */
export const normalizeNic = (input: string): string | null => {
  const value = input.replace(/\s/g, "").toUpperCase();
  return NIC.test(value) ? value : null;
};
