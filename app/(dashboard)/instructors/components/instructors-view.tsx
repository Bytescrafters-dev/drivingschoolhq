"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PlusIcon, IdCardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoPermissionState } from "@/components/common/no-permission-state";
import { PageSectionHeader } from "@/components/common/page-section-header";
import { useActiveBranch } from "@/components/branches/active-branch-provider";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useMe } from "@/hooks/my-profile/useProfile";
import { useInstructors } from "@/hooks/instructors/useInstructors";
import { instructorProfile } from "@/shared/constants/pageUrls";
import { TenantPermission } from "@/shared/constants/permissions";
import type { InstructorProfileState } from "@/types/instructor";
import { AddInstructorDialog } from "./add-instructor-dialog";
import {
  InstructorsTable,
  InstructorsTableSkeleton,
} from "./instructors-table";
import { useInstructorActions } from "./use-instructor-actions";

const FILTERS: { value: InstructorProfileState | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "SETUP_REQUIRED", label: "Setup required" },
  { value: "INACTIVE", label: "Inactive" },
];

const parseStatus = (value: string | null): InstructorProfileState | null =>
  value === "ACTIVE" || value === "SETUP_REQUIRED" || value === "INACTIVE"
    ? value
    : null;

export const InstructorsView = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = parseStatus(searchParams.get("status"));

  const setStatus = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value === "ALL") params.delete("status");
      else params.set("status", value);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const { data: me } = useMe();
  const { hasPermission } = usePermissions();
  const canView = hasPermission(TenantPermission.INSTRUCTORS_VIEW);
  const canManage = hasPermission(TenantPermission.INSTRUCTORS_MANAGE);
  const { branch } = useActiveBranch();

  const list = useInstructors(status, canView);
  const [adding, setAdding] = useState(false);
  const actions = useInstructorActions({
    onSetupDone: (detail) =>
      router.push(`${instructorProfile(detail.user.id)}?setup=1`),
  });

  if (!canView) {
    return (
      <NoPermissionState message="Ask your school owner or admin for access to instructors." />
    );
  }

  const branchName = branch?.name ?? "this branch";
  const addButton = canManage && (
    <Button onClick={() => setAdding(true)}>
      <PlusIcon />
      Add instructor profile
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageSectionHeader
        title={`Instructors — ${branchName}`}
        description="Staff who teach at this branch, and the vehicle classes they can teach here."
        actions={addButton}
      />

      <Tabs value={status ?? "ALL"} onValueChange={setStatus}>
        <TabsList className="h-auto flex-wrap">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {list.isPending ? (
        <InstructorsTableSkeleton />
      ) : list.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">Couldn&apos;t load instructors</p>
          <p className="text-muted-foreground text-sm">
            Check your connection and try again.
          </p>
          <Button
            variant="outline"
            onClick={() => list.refetch()}
            disabled={list.isFetching}
          >
            {list.isFetching ? "Retrying..." : "Retry"}
          </Button>
        </div>
      ) : list.data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <IdCardIcon
            className="text-muted-foreground size-6"
            aria-hidden
          />
          <p className="font-medium">
            {status
              ? "No instructors match this filter."
              : "No instructors in this branch yet."}
          </p>
          {!status && addButton && <div className="mt-2">{addButton}</div>}
        </div>
      ) : (
        <InstructorsTable
          items={list.data}
          currentUserId={me?.user.id}
          busyUserId={actions.busyUserId}
          onSetup={(item) => actions.openSetup(item.user)}
          onInactivate={actions.openInactivate}
          onReactivate={actions.reactivate}
        />
      )}

      <AddInstructorDialog
        open={adding}
        onOpenChange={setAdding}
        branchName={branchName}
        onPick={actions.openSetup}
      />
      {actions.dialogs}
    </div>
  );
};
