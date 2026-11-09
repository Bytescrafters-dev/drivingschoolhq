"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoIcon, PlusIcon, SearchXIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useBranch } from "@/hooks/branches/useBranches";
import { useBranchProfile } from "@/hooks/branches/useBranchProfile";
import { useVehicleClasses } from "@/hooks/branches/useVehicleClasses";
import { ApiError } from "@/lib/api/client";
import { districtLabel } from "@/shared/constants/districts";
import { gradeLabel } from "@/shared/constants/grades";
import { SETTINGS, SETTINGS_BRANCHES } from "@/shared/constants/pageUrls";
import { TenantPermission } from "@/shared/constants/permissions";
import { BranchStatusBadge } from "../../../components/branch-status-badge";
import { LicenceCard } from "@/components/licences/licence-card";
import type {
  LicenceDialogMode,
  LicenceSaved,
} from "@/components/licences/licence-dialog";
import { LicenceHistoryCard } from "@/components/licences/licence-history-card";
import {
  VehicleClassSelectionCard,
  type ClassSelectionSave,
} from "@/components/licences/vehicle-class-selection-card";
import { useSetOfferedClasses } from "@/hooks/branches/useBranchProfileMutations";
import {
  getApiErrorCode,
  getApiErrorMessage,
  isGloballyHandledError,
} from "@/lib/api/error-messages";
import { permittedCodes } from "@/lib/vehicle-classes";
import type { BranchProfile, LicenceChangeResponse } from "@/types/branch";
import type { LicenceExpiry } from "@/types/licence";
import { BranchLicenceDialog } from "./branch-licence-dialog";
import { ReadinessBanners } from "./readiness-banners";

const Crumbs = ({ current }: { current: string }) => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link href={SETTINGS}>Settings</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link href={SETTINGS_BRANCHES}>Branches</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{current}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

const isNotFound = (error: unknown) =>
  error instanceof ApiError && error.status === 404;

const ProfileSkeleton = () => (
  <div className="grid gap-6" aria-busy="true">
    <Skeleton className="h-5 w-64" />
    <Skeleton className="h-8 w-72" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-72 w-full" />
    <span className="sr-only">Loading branch profile</span>
  </div>
);

const codesNotIn = (codes: string[], exclude: Set<string>) =>
  codes.filter((code) => !exclude.has(code));

const branchExpiry = (profile: BranchProfile): LicenceExpiry | undefined => {
  const w = profile.readiness.warnings[0];
  if (!w) return undefined;
  return w.code === "BRANCH_LICENCE_EXPIRED"
    ? { kind: "expired", date: w.expiredOn }
    : { kind: "expiring", date: w.expiresOn, daysLeft: w.daysLeft };
};

/** Returns true when the class editor should close. */
const handleClassSaveError = (error: unknown): boolean => {
  const code = getApiErrorCode(error);
  if (code === "VEHICLE_CLASS_NOT_PERMITTED") {
    // The profile refetches; keep editing against the new grade.
    toast.error(getApiErrorMessage(error));
    return false;
  }
  if (code === "BRANCH_CLOSED") {
    toast.error("Reopen the branch to edit its profile.");
    return true;
  }
  if (isGloballyHandledError(error)) return true;
  toast.error(getApiErrorMessage(error));
  return code === "BRANCH_LICENCE_MISSING" || code === "BRANCH_NOT_FOUND";
};

export const BranchProfileView = ({ branchId }: { branchId: string }) => {
  const branch = useBranch(branchId);
  const profile = useBranchProfile(branchId);
  const classes = useVehicleClasses();
  const { hasPermission } = usePermissions();
  const setClasses = useSetOfferedClasses(branchId);

  const [dialog, setDialog] = useState<LicenceDialogMode | null>(null);
  const [editingClasses, setEditingClasses] = useState(false);
  const [classHint, setClassHint] = useState<string | null>(null);

  // Unknown, another school's, or not accessible: all look the same.
  if (isNotFound(branch.error) || isNotFound(profile.error)) {
    return (
      <>
        <Crumbs current="Branch profile" />
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <SearchXIcon className="text-muted-foreground size-6" aria-hidden />
          <p className="font-medium">Branch not found</p>
          <p className="text-muted-foreground text-sm">
            This branch doesn&apos;t exist or you can&apos;t access it.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href={SETTINGS_BRANCHES}>Back to branches</Link>
          </Button>
        </div>
      </>
    );
  }

  if (branch.isError || profile.isError || classes.isError) {
    const retry = () => {
      if (branch.isError) void branch.refetch();
      if (profile.isError) void profile.refetch();
      if (classes.isError) void classes.refetch();
    };
    return (
      <>
        <Crumbs current="Branch profile" />
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">Couldn&apos;t load the branch profile</p>
          <p className="text-muted-foreground text-sm">
            Check your connection and try again.
          </p>
          <Button
            variant="outline"
            onClick={retry}
            disabled={branch.isFetching || profile.isFetching || classes.isFetching}
          >
            Retry
          </Button>
        </div>
      </>
    );
  }

  if (branch.isPending || profile.isPending || classes.isPending) {
    return <ProfileSkeleton />;
  }

  const isOpen = branch.data.status === "ACTIVE";
  const canManage = hasPermission(TenantPermission.BRANCHES_MANAGE);
  const canEdit = canManage && isOpen;

  const editClasses = () => {
    setEditingClasses(true);
    document
      .getElementById("vehicle-classes")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onLicenceSaved = ({
    mode,
    response,
    previousGrade,
  }: LicenceSaved<LicenceChangeResponse>) => {
    const grade = response.currentLicence?.grade;

    if (mode === "first") {
      toast.success("Licence added");
      if (grade) {
        setClassHint(
          `All ${gradeLabel(grade)} classes are selected. Untick the ones this branch doesn't offer.`,
        );
        editClasses();
      }
      return;
    }

    const removed = response.removedVehicleClasses;
    toast.success(mode === "renew" ? "Licence renewed" : "Licence updated", {
      description:
        removed.length > 0 ? `Removed classes: ${removed.join(", ")}` : undefined,
    });

    // A higher grade doesn't tick newly permitted classes automatically.
    const before = new Set(
      previousGrade ? permittedCodes(previousGrade, classes.data) : [],
    );
    const offered = new Set(response.offeredVehicleClasses.map((c) => c.code));
    const added = codesNotIn(
      codesNotIn(
        response.permittedVehicleClasses.map((c) => c.code),
        before,
      ),
      offered,
    );
    setClassHint(
      grade && added.length > 0
        ? `${gradeLabel(grade)} also permits ${added.join(", ")}. Tick them in Vehicle classes if this branch offers them.`
        : null,
    );
  };

  const grade = profile.data.currentLicence?.grade;
  const hasLicence = profile.data.currentLicence !== null;
  const offered = profile.data.offeredVehicleClasses.map((c) => c.code);
  const permitted = profile.data.permittedVehicleClasses.map((c) => c.code);

  const saveClasses: ClassSelectionSave = {
    isPending: setClasses.isPending,
    submit: (codes, onSettled) =>
      setClasses.mutate(codes, {
        onSuccess: () => {
          toast.success("Vehicle classes saved");
          setClassHint(null);
          onSettled(true);
        },
        onError: (error) => onSettled(handleClassSaveError(error)),
      }),
  };

  return (
    <>
      <Crumbs current={`${branch.data.name} profile`} />

      <div className="space-y-1">
        <div className="flex flex-wrap items-start gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            {branch.data.name} profile
          </h2>
          <BranchStatusBadge branch={branch.data} />
        </div>
        <p className="text-muted-foreground text-sm">
          {districtLabel(branch.data.district)}
          {grade && ` · ${gradeLabel(grade)}`}
        </p>
      </div>

      {!canManage && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <InfoIcon className="size-4 shrink-0" aria-hidden />
          Ask your school owner or admin to change the branch profile.
        </p>
      )}
      {canManage && !isOpen && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <InfoIcon className="size-4 shrink-0" aria-hidden />
          This branch is closed. Reopen it to edit its profile.
        </p>
      )}

      <ReadinessBanners
        readiness={profile.data.readiness}
        actions={
          canEdit
            ? {
                onAddLicence: () => setDialog("first"),
                onEditClasses: editClasses,
                onRenew: () => setDialog("renew"),
              }
            : undefined
        }
      />

      <LicenceCard
        title="Driving-school licence"
        description="The licence grade decides which vehicle classes this branch may offer."
        licence={profile.data.currentLicence}
        expiry={branchExpiry(profile.data)}
        onRenew={canEdit ? () => setDialog("renew") : undefined}
        onCorrect={canEdit ? () => setDialog("correct") : undefined}
        empty={{
          title: "No licence recorded",
          description:
            "Without a licence the branch has no grade, so it can't offer vehicle classes.",
          action: canEdit && (
            <Button size="sm" onClick={() => setDialog("first")}>
              <PlusIcon />
              Add licence
            </Button>
          ),
        }}
      />

      <VehicleClassSelectionCard
        title="Vehicle classes"
        description={
          hasLicence
            ? `${offered.length} of ${permitted.length} permitted classes offered.`
            : "Add the licence first to set the grade."
        }
        classes={classes.data}
        permittedCodes={permitted}
        selectedCodes={offered}
        hasLicence={hasLicence}
        canEdit={canEdit}
        editing={editingClasses}
        onEditingChange={setEditingClasses}
        hint={classHint}
        onDismissHint={() => setClassHint(null)}
        save={saveClasses}
        legend="Vehicle classes this branch offers"
        editNote="Removing a class only affects new applications. Customers and applications that already have it are not affected."
        emptyConfirm={{
          title: "Offer no vehicle classes?",
          description:
            "This branch will offer no classes and can't take class-dependent work.",
          confirm: "Save with no classes",
        }}
      />

      <LicenceHistoryCard
        history={profile.data.licenceHistory}
        currentId={profile.data.currentLicence?.id}
      />

      <BranchLicenceDialog
        mode={canEdit ? dialog : null}
        onOpenChange={(open) => !open && setDialog(null)}
        branchId={branchId}
        profile={profile.data}
        classes={classes.data}
        onSaved={onLicenceSaved}
      />
    </>
  );
};
