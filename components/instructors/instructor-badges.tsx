import { Badge } from "@/components/ui/badge";
import { AMBER_BADGE } from "@/components/licences/expiry";
import type { InstructorProfileState } from "@/types/instructor";

export const PROFILE_STATUS_LABELS: Record<InstructorProfileState, string> = {
  ACTIVE: "Active",
  SETUP_REQUIRED: "Setup required",
  INACTIVE: "Inactive",
};

/** Instructor profile status (separate from the staff status). */
export const ProfileStatusBadge = ({
  status,
}: {
  status: InstructorProfileState;
}) => {
  if (status === "ACTIVE") {
    return (
      <Badge className="border-transparent bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200">
        Active
      </Badge>
    );
  }
  if (status === "SETUP_REQUIRED") {
    return <Badge className={AMBER_BADGE}>Setup required</Badge>;
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Inactive
    </Badge>
  );
};

/** The person's staff account can't sign in. */
export const StaffDisabledBadge = () => (
  <Badge variant="destructive">Staff disabled</Badge>
);

/** Class-code chips; "None" when empty. */
export const ClassChips = ({ codes }: { codes: string[] }) =>
  codes.length > 0 ? (
    <div className="flex flex-wrap gap-1">
      {codes.map((code) => (
        <Badge key={code} variant="outline" className="font-mono">
          {code}
        </Badge>
      ))}
    </div>
  ) : (
    <span className="text-muted-foreground text-sm">None</span>
  );
