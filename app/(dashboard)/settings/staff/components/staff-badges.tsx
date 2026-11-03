import { Badge } from "@/components/ui/badge";
import { roleLabel } from "@/shared/constants/roles";
import type { Staff } from "@/types/staff";

export const StaffRoleBadge = ({ role }: { role: string }) => (
  <Badge variant="outline">{roleLabel(role)}</Badge>
);

export const StaffStatusBadge = ({ status }: { status: Staff["status"] }) =>
  status === "ACTIVE" ? (
    <Badge variant="secondary">Active</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Disabled
    </Badge>
  );

/** Temporary-password and can't-sign-in flags. */
export const StaffFlags = ({ staff }: { staff: Staff }) => (
  <>
    {staff.mustChangePassword && (
      <Badge variant="outline">Temporary password</Badge>
    )}
    {!staff.hasActiveBranch && staff.status === "ACTIVE" && (
      <Badge className="border-transparent bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
        Can&apos;t sign in: no open branch
      </Badge>
    )}
  </>
);

/** "All branches" or chips; closed branches are struck through. */
export const StaffBranches = ({ staff }: { staff: Staff }) =>
  staff.branchAccess === "ALL" ? (
    <span className="text-sm">All branches</span>
  ) : (
    <div className="flex flex-wrap gap-1">
      {staff.branches.map((b) => (
        <Badge
          key={b.id}
          variant="outline"
          className={
            b.status === "CLOSED" ? "text-muted-foreground line-through" : ""
          }
          title={b.status === "CLOSED" ? `${b.name} (closed)` : undefined}
        >
          {b.name}
          {b.status === "CLOSED" && <span className="sr-only"> (closed)</span>}
        </Badge>
      ))}
    </div>
  );
