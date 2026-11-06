"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoIcon, SearchXIcon } from "lucide-react";
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
import {
  LicenceDialog,
  type LicenceDialogMode,
  type LicenceSaved,
} from "./licence-dialog";
import { LicenceCard } from "./licence-card";
import { LicenceHistoryCard } from "./licence-history-card";
import { ReadinessBanners } from "./readiness-banners";
import { VehicleClassCard } from "./vehicle-class-card";

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

export const BranchProfileView = ({ branchId }: { branchId: string }) => {
  const branch = useBranch(branchId);
  const profile = useBranchProfile(branchId);
  const classes = useVehicleClasses();
  const { hasPermission } = usePermissions();

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

  const onLicenceSaved = ({ mode, response, previous }: LicenceSaved) => {
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
    const before = new Set(previous.permittedVehicleClasses.map((c) => c.code));
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
        profile={profile.data}
        onOpenDialog={canEdit ? setDialog : undefined}
      />

      <VehicleClassCard
        branchId={branchId}
        profile={profile.data}
        classes={classes.data}
        canEdit={canEdit}
        editing={editingClasses}
        onEditingChange={setEditingClasses}
        hint={classHint}
        onDismissHint={() => setClassHint(null)}
      />

      <LicenceHistoryCard profile={profile.data} />

      <LicenceDialog
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
