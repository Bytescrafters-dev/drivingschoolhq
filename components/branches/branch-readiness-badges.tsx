import { Badge } from "@/components/ui/badge";
import type { BranchReadiness } from "@/types/branch";

export const AMBER_BADGE =
  "border-transparent bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200";

export const daysLeftLabel = (daysLeft: number) =>
  daysLeft === 0
    ? "today"
    : `in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;

/** Compact profile hints for lists: incomplete, expired, expiring. */
export const BranchReadinessBadges = ({
  readiness,
}: {
  readiness: BranchReadiness;
}) => (
  <>
    {readiness.blockers.length > 0 && (
      <Badge className={AMBER_BADGE}>Profile incomplete</Badge>
    )}
    {readiness.warnings.map((warning) =>
      warning.code === "BRANCH_LICENCE_EXPIRED" ? (
        <Badge key={warning.code} variant="destructive">
          Licence expired
        </Badge>
      ) : (
        <Badge key={warning.code} className={AMBER_BADGE}>
          Licence expires {daysLeftLabel(warning.daysLeft)}
        </Badge>
      ),
    )}
  </>
);
