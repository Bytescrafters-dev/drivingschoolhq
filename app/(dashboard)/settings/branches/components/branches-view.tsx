"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { InfoIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageSectionHeader } from "@/components/common/page-section-header";
import { useActiveBranch } from "@/components/branches/active-branch-provider";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useMe } from "@/hooks/my-profile/useProfile";
import { useBranches } from "@/hooks/branches/useBranches";
import {
  useReopenBranch,
  useSetDefaultBranch,
} from "@/hooks/branches/useBranchMutations";
import {
  getApiErrorCode,
  getApiErrorMessage,
  isGloballyHandledError,
} from "@/lib/api/error-messages";
import { TenantPermission } from "@/shared/constants/permissions";
import type {
  Branch,
  BranchListItem,
  CloseBranchResponse,
} from "@/types/branch";
import {
  BranchesTable,
  BranchesTableError,
  BranchesTableSkeleton,
} from "./branches-table";
import { BranchFormDialog } from "./branch-form-dialog";
import { CloseBranchDialog } from "./close-branch-dialog";
import { LockedOutStaffDialog } from "./locked-out-staff-dialog";
import { PlanLimitDialog } from "./plan-limit-dialog";
import { BranchDetailSheet } from "./branch-detail-sheet";

/** Toast for action errors not already handled app-wide. */
const notifyError = (error: unknown) => {
  if (!isGloballyHandledError(error)) toast.error(getApiErrorMessage(error));
};

type FormState = { open: false } | { open: true; branch?: Branch };

export const BranchesView = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state: shareable and survives reloads.
  const includeClosed = searchParams.get("closed") === "1";
  const viewId = searchParams.get("view");

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set(key, value);
      else params.delete(key);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const { data: me } = useMe();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(TenantPermission.BRANCHES_MANAGE);
  const {
    branchId: activeBranchId,
    branches: workable,
    setActiveBranch,
  } = useActiveBranch();
  const workableBranchIds = useMemo(
    () => new Set(workable.map((b) => b.id)),
    [workable],
  );

  const list = useBranches(includeClosed);
  const reopen = useReopenBranch();
  const setDefault = useSetDefaultBranch();

  const [form, setForm] = useState<FormState>({ open: false });
  const [closing, setClosing] = useState<BranchListItem | null>(null);
  const [closeResult, setCloseResult] = useState<CloseBranchResponse | null>(
    null,
  );
  const [planLimitMessage, setPlanLimitMessage] = useState<string | null>(null);

  const busyBranchId =
    (reopen.isPending && reopen.variables) ||
    (setDefault.isPending && setDefault.variables) ||
    null;

  const onCreated = (branch: Branch) =>
    toast.success("Branch created", {
      description: branch.name,
      action: {
        label: "Switch to it",
        onClick: () => setActiveBranch(branch.id),
      },
    });

  const onClosed = (result: CloseBranchResponse) => {
    toast.success(`${result.name} closed`);
    // If it was this tab's branch, ActiveBranchProvider switches and explains
    // once `me` refreshes.
    if (result.lockedOutStaff.length > 0) setCloseResult(result);
  };

  const handlers = {
    onView: (b: BranchListItem) => setParam("view", b.id),
    onSwitch: (b: BranchListItem) => {
      setActiveBranch(b.id);
      toast.success(`Switched to ${b.name}`);
    },
    onMakeDefault: (b: BranchListItem) =>
      setDefault.mutate(b.id, {
        onSuccess: () =>
          toast.success(`${b.name} will open by default next time`),
        onError: notifyError,
      }),
    onEdit: (b: BranchListItem) => setForm({ open: true, branch: b }),
    onClose: (b: BranchListItem) => setClosing(b),
    onReopen: (b: BranchListItem) =>
      reopen.mutate(b.id, {
        onSuccess: () => toast.success(`${b.name} reopened`),
        onError: (error) => {
          if (getApiErrorCode(error) === "PLAN_LIMIT_REACHED") {
            setPlanLimitMessage(error.message);
          } else {
            notifyError(error);
          }
        },
      }),
  };

  return (
    <div className="flex flex-col gap-6">
      <PageSectionHeader
        title="Branches"
        description={
          me?.user.branchAccess === "SELECTED"
            ? "Branches you're assigned to."
            : "Your school's branches."
        }
        actions={
          canManage && (
            <Button onClick={() => setForm({ open: true })}>
              <PlusIcon />
              New branch
            </Button>
          )
        }
      />

      {!canManage && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <InfoIcon className="size-4 shrink-0" aria-hidden />
          Ask your school owner or admin to add or change branches.
        </p>
      )}

      <div className="flex items-center gap-2">
        <Switch
          id="show-closed"
          checked={includeClosed}
          onCheckedChange={(checked) =>
            setParam("closed", checked ? "1" : null)
          }
        />
        <Label htmlFor="show-closed">Show closed branches</Label>
      </div>

      {list.isPending ? (
        <BranchesTableSkeleton />
      ) : list.isError ? (
        <BranchesTableError
          onRetry={() => list.refetch()}
          retrying={list.isFetching}
        />
      ) : (
        <BranchesTable
          branches={list.data.items}
          activeBranchId={activeBranchId}
          workableBranchIds={workableBranchIds}
          canManage={canManage}
          seesAllBranches={me?.user.branchAccess === "ALL"}
          busyBranchId={busyBranchId}
          {...handlers}
        />
      )}

      <BranchFormDialog
        open={form.open}
        branch={form.open ? form.branch : undefined}
        onOpenChange={(open) => !open && setForm({ open: false })}
        onCreated={onCreated}
        onPlanLimit={setPlanLimitMessage}
      />
      <CloseBranchDialog
        branch={closing}
        onOpenChange={(open) => !open && setClosing(null)}
        onClosed={onClosed}
      />
      <LockedOutStaffDialog
        result={closeResult}
        onOpenChange={(open) => !open && setCloseResult(null)}
      />
      <PlanLimitDialog
        message={planLimitMessage}
        onOpenChange={(open) => !open && setPlanLimitMessage(null)}
      />
      <BranchDetailSheet
        branchId={viewId}
        onOpenChange={(open) => !open && setParam("view", null)}
      />
    </div>
  );
};
