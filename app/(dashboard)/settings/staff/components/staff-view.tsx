"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ListPagination } from "@/components/common/list-pagination";
import { NoPermissionState } from "@/components/common/no-permission-state";
import { PageSectionHeader } from "@/components/common/page-section-header";
import { PlanLimitDialog } from "@/components/common/plan-limit-dialog";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useMe } from "@/hooks/my-profile/useProfile";
import { useStaffList } from "@/hooks/staff/useStaff";
import { useEnableStaff } from "@/hooks/staff/useStaffMutations";
import {
  getApiErrorCode,
  getApiErrorMessage,
  isGloballyHandledError,
} from "@/lib/api/error-messages";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/common";
import { TenantPermission } from "@/shared/constants/permissions";
import { TENANT_ROLES } from "@/shared/constants/roles";
import type { TenantRole } from "@/types/auth";
import type { Staff, StaffListFilters, StaffStatus } from "@/types/staff";
import { AddStaffDialog } from "./add-staff-dialog";
import { ChangeBranchesDialog } from "./change-branches-dialog";
import { ChangeRoleDialog } from "./change-role-dialog";
import { DisableStaffDialog } from "./disable-staff-dialog";
import { EditStaffDetailsDialog } from "./edit-staff-details-dialog";
import { NoOpenBranchDialog } from "./no-open-branch-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import type { StaffActionHandlers } from "./staff-actions-menu";
import { StaffDetailSheet } from "./staff-detail-sheet";
import { StaffFilters } from "./staff-filters";
import { StaffTable, StaffTableError, StaffTableSkeleton } from "./staff-table";

type DialogKind = "edit" | "role" | "branches" | "reset" | "disable";
type OpenDialog = { kind: DialogKind; staff: Staff } | null;

const STATUS_VALUES = ["ACTIVE", "DISABLED", "ALL"];

const positiveInt = (value: string | null, fallback: number) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

/** Reads (and sanitises) list state from the URL. */
const useStaffUrlState = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get("role");
  const statusParam = searchParams.get("status") ?? "ACTIVE";
  const sizeParam = positiveInt(searchParams.get("size"), DEFAULT_PAGE_SIZE);

  const state = {
    search: searchParams.get("q") ?? "",
    role: TENANT_ROLES.includes(roleParam as TenantRole) ? roleParam : null,
    status: STATUS_VALUES.includes(statusParam) ? statusParam : "ACTIVE",
    branchId: searchParams.get("branch"),
    page: positiveInt(searchParams.get("page"), 1),
    pageSize: PAGE_SIZE_OPTIONS.includes(sizeParam)
      ? sizeParam
      : DEFAULT_PAGE_SIZE,
    viewId: searchParams.get("view"),
  };

  /** Sets params; any change other than page/view resets to page 1. */
  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      if (Object.keys(changes).some((k) => k !== "page" && k !== "view")) {
        params.delete("page");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  return { state, update };
};

export const StaffView = () => {
  const { hasPermission } = usePermissions();
  const canManageStaff = hasPermission(TenantPermission.STAFF_MANAGE);
  const { data: me } = useMe();
  const { state, update } = useStaffUrlState();

  const filters: StaffListFilters = {
    status: state.status === "ALL" ? undefined : (state.status as StaffStatus),
    role: (state.role as TenantRole | null) ?? undefined,
    branchId: state.branchId ?? undefined,
    search: state.search || undefined,
    page: state.page,
    pageSize: state.pageSize,
  };
  const list = useStaffList(filters, canManageStaff);
  const enable = useEnableStaff();

  const [addOpen, setAddOpen] = useState(false);
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [seatLimitMessage, setSeatLimitMessage] = useState<string | null>(null);
  const [noOpenBranch, setNoOpenBranch] = useState<Staff | null>(null);

  if (!canManageStaff) {
    return (
      <NoPermissionState message="You don't have access to staff management. Ask your school owner or admin." />
    );
  }

  const open = (kind: DialogKind) => (staff: Staff) =>
    setDialog({ kind, staff });
  const closeDialog = (isOpen: boolean) => !isOpen && setDialog(null);
  const dialogStaff = (kind: DialogKind) =>
    dialog?.kind === kind ? dialog.staff : null;

  const handlers: StaffActionHandlers = {
    onEdit: open("edit"),
    onChangeRole: open("role"),
    onChangeBranches: open("branches"),
    onResetPassword: open("reset"),
    onDisable: open("disable"),
    onEnable: (staff) =>
      enable.mutate(staff.id, {
        onSuccess: (updated) => {
          toast.success(`${updated.fullName} was enabled`);
          if (!updated.hasActiveBranch) setNoOpenBranch(updated);
        },
        onError: (error) => {
          if (getApiErrorCode(error) === "PLAN_LIMIT_REACHED") {
            setSeatLimitMessage(error.message);
          } else if (!isGloballyHandledError(error)) {
            toast.error(getApiErrorMessage(error));
          }
        },
      }),
  };

  const hasFilters = Boolean(
    state.search || state.role || state.branchId || state.status !== "ACTIVE",
  );

  return (
    <div className="flex flex-col gap-6">
      <PageSectionHeader
        title="Staff"
        description="People who can sign in to your school's dashboard."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <UserPlusIcon />
            Add staff
          </Button>
        }
      />

      <StaffFilters
        values={state}
        branches={me?.branches ?? []}
        onChange={(key, value) => update({ [key]: value })}
      />

      {list.isPending ? (
        <StaffTableSkeleton />
      ) : list.isError ? (
        <StaffTableError
          onRetry={() => list.refetch()}
          retrying={list.isFetching}
        />
      ) : (
        <div
          className="flex flex-col gap-4"
          aria-busy={list.isPlaceholderData || undefined}
        >
          <StaffTable
            staff={list.data.items}
            selfId={me?.user.id}
            hasFilters={hasFilters}
            busyStaffId={enable.isPending ? (enable.variables ?? null) : null}
            onView={(staff) => update({ view: staff.id })}
            {...handlers}
          />
          <ListPagination
            id="staff-page-size"
            page={list.data.page}
            pageSize={list.data.pageSize}
            total={list.data.total}
            disabled={list.isFetching}
            onPageChange={(page) => update({ page: String(page) })}
            onPageSizeChange={(size) =>
              update({
                size: size === DEFAULT_PAGE_SIZE ? null : String(size),
              })
            }
          />
        </div>
      )}

      <StaffDetailSheet
        staffId={state.viewId}
        selfId={me?.user.id}
        onOpenChange={(isOpen) => !isOpen && update({ view: null })}
        handlers={handlers}
      />

      <AddStaffDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onPlanLimit={setSeatLimitMessage}
      />
      <EditStaffDetailsDialog
        staff={dialogStaff("edit")}
        onOpenChange={closeDialog}
      />
      <ChangeRoleDialog
        staff={dialogStaff("role")}
        onOpenChange={closeDialog}
      />
      <ChangeBranchesDialog
        staff={dialogStaff("branches")}
        onOpenChange={closeDialog}
      />
      <ResetPasswordDialog
        staff={dialogStaff("reset")}
        onOpenChange={closeDialog}
      />
      <DisableStaffDialog
        staff={dialogStaff("disable")}
        onOpenChange={closeDialog}
      />
      <NoOpenBranchDialog
        staff={noOpenBranch}
        onOpenChange={(isOpen) => !isOpen && setNoOpenBranch(null)}
        onChangeBranches={(staff) => {
          setNoOpenBranch(null);
          setDialog({ kind: "branches", staff });
        }}
      />
      <PlanLimitDialog
        title="Staff limit reached"
        description="Your plan's staff limit (including the owner) is reached. Disable someone or contact DrivingSchoolHQ to upgrade."
        message={seatLimitMessage}
        onOpenChange={(isOpen) => !isOpen && setSeatLimitMessage(null)}
      />
    </div>
  );
};
