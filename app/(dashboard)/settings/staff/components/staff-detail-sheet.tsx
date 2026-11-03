"use client";

import Link from "next/link";
import { SearchXIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaffMember } from "@/hooks/staff/useStaff";
import { ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/dates";
import { formatLkPhone } from "@/lib/phone";
import { MY_PROFILE } from "@/shared/constants/pageUrls";
import {
  StaffActionsMenu,
  type StaffActionHandlers,
} from "./staff-actions-menu";
import { StaffFlags, StaffRoleBadge, StaffStatusBadge } from "./staff-badges";

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="grid gap-1">
    <dt className="text-muted-foreground text-xs">{label}</dt>
    <dd className="text-sm break-words">{children}</dd>
  </div>
);

const StaffDetail = ({
  id,
  selfId,
  handlers,
}: {
  id: string;
  selfId: string | undefined;
  handlers: StaffActionHandlers;
}) => {
  const {
    data: staff,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useStaffMember(id, true);

  if (isPending) {
    return (
      <div className="grid gap-4 p-4" aria-busy="true">
        <SheetTitle className="sr-only">Loading staff member</SheetTitle>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  // Unknown or not visible to you: both are 404.
  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <SearchXIcon className="text-muted-foreground size-6" aria-hidden />
        <SheetTitle>Staff member not found</SheetTitle>
        <SheetDescription>
          They don&apos;t exist or you can&apos;t view them.
        </SheetDescription>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
        <SheetTitle>Couldn&apos;t load this staff member</SheetTitle>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Retry
        </Button>
      </div>
    );
  }

  const isSelf = staff.id === selfId;

  return (
    <>
      <SheetHeader>
        <SheetTitle>{staff.fullName}</SheetTitle>
        <SheetDescription className="break-all">{staff.email}</SheetDescription>
        <div className="flex flex-wrap gap-1 pt-1">
          <StaffRoleBadge role={staff.role} />
          <StaffStatusBadge status={staff.status} />
          <StaffFlags staff={staff} />
        </div>
      </SheetHeader>
      <div className="px-4">
        {isSelf ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={MY_PROFILE}>Edit in My profile</Link>
          </Button>
        ) : (
          staff.canManage && <StaffActionsMenu staff={staff} {...handlers} />
        )}
      </div>
      <dl className="grid gap-4 p-4">
        <Row label="Phone">
          {staff.phone ? formatLkPhone(staff.phone) : "—"}
        </Row>
        <Row label="NIC">{staff.nic ?? "—"}</Row>
        <Row label="Branch access">
          {staff.branchAccess === "ALL" ? (
            "All branches"
          ) : (
            <ul className="grid gap-1">
              {staff.branches.map((b) => (
                <li key={b.id} className="flex items-center gap-1.5">
                  <span
                    className={
                      b.status === "CLOSED"
                        ? "text-muted-foreground line-through"
                        : undefined
                    }
                  >
                    {b.name}
                  </span>
                  {b.status === "CLOSED" && (
                    <span className="text-muted-foreground text-xs">
                      (closed)
                    </span>
                  )}
                  {b.id === staff.defaultBranchId && (
                    <StarIcon
                      className="size-3.5 fill-current text-amber-500"
                      aria-label="Default branch"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Row>
        <Row label="Last login">
          {staff.lastLoginAt ? formatDateTime(staff.lastLoginAt) : "Never"}
        </Row>
        {staff.disabledAt && (
          <Row label="Disabled">{formatDateTime(staff.disabledAt)}</Row>
        )}
        <Row label="Added">{formatDateTime(staff.createdAt)}</Row>
        <Row label="Last updated">{formatDateTime(staff.updatedAt)}</Row>
      </dl>
    </>
  );
};

/** Staff details, opened via `?view=<id>` (deep-linkable). */
export const StaffDetailSheet = ({
  staffId,
  selfId,
  onOpenChange,
  handlers,
}: {
  staffId: string | null;
  selfId: string | undefined;
  onOpenChange: (open: boolean) => void;
  handlers: StaffActionHandlers;
}) => (
  <Sheet open={Boolean(staffId)} onOpenChange={onOpenChange}>
    <SheetContent className="w-full overflow-y-auto sm:max-w-md">
      {staffId && (
        <StaffDetail
          key={staffId}
          id={staffId}
          selfId={selfId}
          handlers={handlers}
        />
      )}
    </SheetContent>
  </Sheet>
);
