export const AMBER_BADGE =
  "border-transparent bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200";

export const AMBER_ALERT =
  "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100 *:data-[slot=alert-description]:text-amber-900/90 dark:*:data-[slot=alert-description]:text-amber-100/90";

/** "today", "in 1 day", "in 12 days". */
export const daysLeftLabel = (daysLeft: number) =>
  daysLeft === 0
    ? "today"
    : `in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;

export const daysCount = (daysLeft: number) =>
  `${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;
