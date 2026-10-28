import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (err: unknown) =>
  err ? (err instanceof Error ? err.message : "Something went wrong") : null;

export const getDisplayPrice = (price: number): number => {
  return price / 100;
};

const lkrFormatter = new Intl.NumberFormat("en-LK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a backend decimal string (e.g. "5000.00") as "LKR 5,000.00". Display only. */
export const formatLKR = (amount: string): string => {
  const value = Number(amount);
  return Number.isFinite(value)
    ? `LKR ${lkrFormatter.format(value)}`
    : `LKR ${amount}`;
};

/**
 * Converts a decimal LKR string ("5000.5", "5000.00") to integer cents without
 * floating-point maths. Returns `null` for malformed input.
 */
export const lkrToCents = (amount: string): number | null => {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(amount.trim());
  if (!match) return null;
  const [, whole, fraction = ""] = match;
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
};
