import { Badge } from "@/components/ui/badge";
import { AMBER_BADGE, daysLeftLabel } from "@/components/licences/expiry";
import type { BranchReadiness } from "@/types/branch";

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
