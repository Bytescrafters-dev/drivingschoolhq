import { format } from "date-fns";

/*
 * Subscription dates are calendar dates ("YYYY-MM-DD") in Asia/Colombo.
 * They are displayed as-is, never shifted through a timezone.
 */

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** "2026-11-19" → local Date at midnight of that calendar day (no TZ shift). */
export const calendarDateToDate = (value: string): Date | null => {
  const match = CALENDAR_DATE.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
};

/** Local Date → "YYYY-MM-DD" using its calendar fields. */
export const dateToCalendarDate = (date: Date): string =>
  format(date, "yyyy-MM-dd");

/** "2026-11-19" → "19 Nov 2026". Falls back to the raw value. */
export const formatCalendarDate = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = calendarDateToDate(value);
  return date ? format(date, "dd MMM yyyy") : value;
};

/** "2026-11-19" → "2026-11-18". */
export const dayBefore = (value: string): string => {
  const date = calendarDateToDate(value);
  if (!date) return value;
  date.setDate(date.getDate() - 1);
  return dateToCalendarDate(date);
};

/** Today's calendar date in Asia/Colombo, "YYYY-MM-DD". */
export const todayInColombo = (): string =>
  // en-CA formats as YYYY-MM-DD.
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

/** ISO date-time → local "dd MMM yyyy, HH:mm". */
export const formatDateTime = (iso: string | null | undefined) =>
  iso ? format(new Date(iso), "dd MMM yyyy, HH:mm") : "—";

/** ISO date-time → local "dd MMM yyyy". */
export const formatDate = (iso: string | null | undefined) =>
  iso ? format(new Date(iso), "dd MMM yyyy") : "—";
