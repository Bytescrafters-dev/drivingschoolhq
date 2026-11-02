import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/dates";
import type { Branch } from "@/types/branch";

export const BranchStatusBadge = ({
  branch,
}: {
  branch: Pick<Branch, "status" | "closedAt">;
}) =>
  branch.status === "ACTIVE" ? (
    <Badge variant="secondary">Active</Badge>
  ) : (
    <div className="flex flex-col items-start gap-1">
      <Badge variant="outline" className="text-muted-foreground">
        Closed
      </Badge>
      {branch.closedAt && (
        <span className="text-muted-foreground text-xs">
          Closed on {formatDate(branch.closedAt)}
        </span>
      )}
    </div>
  );
