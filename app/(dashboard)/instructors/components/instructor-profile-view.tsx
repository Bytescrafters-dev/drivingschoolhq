"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ExternalLinkIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  SearchXIcon,
  UserCogIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { NoPermissionState } from "@/components/common/no-permission-state";
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
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useVehicleClasses } from "@/hooks/branches/useVehicleClasses";
import { useMe } from "@/hooks/my-profile/useProfile";
import {
  useInstructor,
  useMyInstructorProfile,
} from "@/hooks/instructors/useInstructors";
import { useSetInstructorClasses } from "@/hooks/instructors/useInstructorMutations";
import { ApiError } from "@/lib/api/client";
import {
  getApiErrorCode,
  getApiErrorMessage,
  isGloballyHandledError,
} from "@/lib/api/error-messages";
import { permittedCodes } from "@/lib/vehicle-classes";
import { gradeLabel } from "@/shared/constants/grades";
import {
  INSTRUCTORS,
  MY_PROFILE,
  SETTINGS_STAFF,
} from "@/shared/constants/pageUrls";
import { TenantPermission } from "@/shared/constants/permissions";
import { roleLabel } from "@/shared/constants/roles";
import type { InstructorDetail } from "@/types/instructor";
import type { LicenceExpiry } from "@/types/licence";
import { InstructorBranchesCard } from "./instructor-branches-card";
import { ProfileStatusBadge, StaffDisabledBadge } from "@/components/instructors/instructor-badges";
import {
  InstructorLicenceDialog,
  type InstructorLicenceResult,
} from "./instructor-licence-dialog";
import { InstructorReadinessBanners } from "./instructor-readiness-banners";
import { useInstructorActions } from "./use-instructor-actions";

/** A staff member's profile, or the signed-in user's own (`"me"`). */
export type InstructorSource = { userId: string } | "me";

const Crumbs = ({ current }: { current: string }) => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link href={INSTRUCTORS}>Instructors</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{current}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

const ProfileSkeleton = () => (
  <div className="grid gap-6" aria-busy="true">
    <Skeleton className="h-5 w-56" />
    <Skeleton className="h-8 w-72" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-72 w-full" />
    <span className="sr-only">Loading instructor profile</span>
  </div>
);

const expiryOf = (detail: InstructorDetail): LicenceExpiry | undefined => {
  const w = detail.readiness.warnings[0];
  if (!w) return undefined;
  return w.code === "INSTRUCTOR_LICENCE_EXPIRED"
    ? { kind: "expired", date: w.expiredOn }
    : { kind: "expiring", date: w.expiresOn, daysLeft: w.daysLeft };
};

/** Returns true when the class editor should close. */
const handleClassSaveError = (error: unknown): boolean => {
  const code = getApiErrorCode(error);
  if (isGloballyHandledError(error)) return true;
  toast.error(getApiErrorMessage(error));
  // VEHICLE_CLASS_NOT_PERMITTED: the detail refetches; keep editing.
  return (
    code === "INSTRUCTOR_MANAGEMENT_DENIED" ||
    code === "INSTRUCTOR_NOT_FOUND" ||
    code === "INSTRUCTOR_PROFILE_MISSING"
  );
};

// Placeholder until we know whose profile it is.
const SETUP_HINT = "setup";

const selfHint = (isSelf: boolean) =>
  `All classes the grade permits are selected. Untick the ones ${isSelf ? "you don't" : "they don't"} teach.`;

export const InstructorProfileView = ({
  source,
}: {
  source: InstructorSource;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMine = source === "me";

  const { data: me } = useMe();
  const { hasPermission } = usePermissions();
  const canView = hasPermission(TenantPermission.INSTRUCTORS_VIEW);
  const other = useInstructor(isMine || !canView ? null : source.userId);
  const mine = useMyInstructorProfile(isMine);
  const query = isMine ? mine : other;
  const classes = useVehicleClasses();

  const detail = query.data;
  const userId = detail?.user.id ?? "";
  const isSelf = Boolean(detail && detail.user.id === me?.user.id);
  const setClasses = useSetInstructorClasses(userId);

  // Arriving from "Set up profile" elsewhere: open the classes for review.
  const fromSetup = searchParams.get("setup") === "1";
  const [editingClasses, setEditingClasses] = useState(fromSetup);
  const [classHint, setClassHint] = useState<string | null>(
    fromSetup ? SETUP_HINT : null,
  );
  const [dialog, setDialog] = useState<LicenceDialogMode | null>(null);

  useEffect(() => {
    if (fromSetup) router.replace(pathname, { scroll: false });
  }, [fromSetup, pathname, router]);

  const editClasses = () => {
    setEditingClasses(true);
    document
      .getElementById("vehicle-classes")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const actions = useInstructorActions({
    onSetupDone: (created) => {
      setClassHint(selfHint(created.user.id === me?.user.id));
      editClasses();
    },
  });

  if (!isMine && !canView) {
    return (
      <NoPermissionState message="Ask your school owner or admin for access to instructors." />
    );
  }

  if (query.error instanceof ApiError && query.error.status === 404) {
    return (
      <>
        <Crumbs current="Instructor" />
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <SearchXIcon className="text-muted-foreground size-6" aria-hidden />
          <p className="font-medium">Instructor not found</p>
          <p className="text-muted-foreground text-sm">
            This person has no instructor profile, or you can&apos;t see them.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href={INSTRUCTORS}>Back to instructors</Link>
          </Button>
        </div>
      </>
    );
  }

  if (query.isError || classes.isError) {
    return (
      <>
        <Crumbs current={isMine ? "My instructor profile" : "Instructor"} />
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">Couldn&apos;t load the instructor profile</p>
          <p className="text-muted-foreground text-sm">
            Check your connection and try again.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (query.isError) void query.refetch();
              if (classes.isError) void classes.refetch();
            }}
            disabled={query.isFetching || classes.isFetching}
          >
            Retry
          </Button>
        </div>
      </>
    );
  }

  if (!detail || !classes.data) return <ProfileSkeleton />;

  const { user, profileStatus, canCreate, canEdit, canChangeStatus } = detail;
  const hasProfile = detail.profile !== null;
  const qualified = detail.qualifiedVehicleClasses;
  const permitted = detail.permittedVehicleClasses.map((c) => c.code);
  const grade = detail.currentLicence?.grade;
  const canManageStaff = hasPermission(TenantPermission.STAFF_MANAGE);

  const onLicenceSaved = ({
    mode,
    response,
    previousGrade,
  }: LicenceSaved<InstructorLicenceResult>) => {
    const removed = response.removedVehicleClasses ?? [];
    const newGrade = response.currentLicence?.grade;
    toast.success(mode === "renew" ? "Licence renewed" : "Licence updated", {
      description:
        removed.length > 0 && newGrade
          ? `Removed because ${gradeLabel(newGrade)} doesn't permit them: ${removed.join(", ")}`
          : undefined,
    });
    // A higher grade adds nothing automatically: point out the new classes.
    const before = new Set(
      previousGrade ? permittedCodes(previousGrade, classes.data) : [],
    );
    const added = response.permittedVehicleClasses
      .map((c) => c.code)
      .filter(
        (code) =>
          !before.has(code) && !response.qualifiedVehicleClasses.includes(code),
      );
    setClassHint(
      newGrade && added.length > 0
        ? `${gradeLabel(newGrade)} also permits ${added.join(", ")}. Tick them if ${isSelf ? "you" : "they"} teach them.`
        : null,
    );
  };

  const saveClasses: ClassSelectionSave = {
    isPending: setClasses.isPending,
    submit: (codes, onSettled) =>
      setClasses.mutate(codes, {
        onSuccess: () => {
          toast.success("Qualified classes saved");
          setClassHint(null);
          onSettled(true);
        },
        onError: (error) => onSettled(handleClassSaveError(error)),
      }),
  };

  const setupButton = canCreate && profileStatus === "SETUP_REQUIRED" && (
    <Button size="sm" onClick={() => actions.openSetup(user)}>
      <UserCogIcon />
      Set up profile
    </Button>
  );

  const title = isSelf ? "My instructor profile" : user.fullName;

  return (
    <>
      <Crumbs current={title} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {isSelf && <span className="text-sm">{user.fullName}</span>}
            <Badge variant="outline">{roleLabel(user.role)}</Badge>
            <ProfileStatusBadge status={profileStatus} />
            {user.status === "DISABLED" && <StaffDisabledBadge />}
            {grade && (
              <span className="text-muted-foreground text-sm">
                {gradeLabel(grade)}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm break-all">
            {user.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canChangeStatus && profileStatus === "ACTIVE" && (
            <Button
              variant="outline"
              onClick={() => actions.openInactivate(detail)}
            >
              <PauseCircleIcon />
              Inactivate
            </Button>
          )}
          {canChangeStatus && profileStatus === "INACTIVE" && (
            <Button
              variant="outline"
              onClick={() => actions.reactivate(detail)}
              disabled={actions.busyUserId === user.id}
            >
              <PlayCircleIcon />
              Reactivate
            </Button>
          )}
          {isSelf ? (
            <Button asChild variant="ghost">
              <Link href={MY_PROFILE}>
                <ExternalLinkIcon />
                My account
              </Link>
            </Button>
          ) : (
            canManageStaff && (
              <Button asChild variant="ghost">
                <Link
                  href={`${SETTINGS_STAFF}?status=ALL&view=${encodeURIComponent(user.id)}`}
                >
                  <ExternalLinkIcon />
                  Staff account
                </Link>
              </Button>
            )
          )}
        </div>
      </div>

      <InstructorReadinessBanners
        detail={detail}
        isSelf={isSelf}
        actions={{
          onSetup: () => actions.openSetup(user),
          onEditClasses: editClasses,
          onRenew: () => setDialog("renew"),
          onInactivate: () => actions.openInactivate(detail),
          onReactivate: () => actions.reactivate(detail),
        }}
      />

      <LicenceCard
        title="Instructor licence"
        description={`The licence grade decides which vehicle classes ${isSelf ? "you" : "they"} can be qualified to teach.`}
        licence={detail.currentLicence}
        expiry={expiryOf(detail)}
        onRenew={canEdit && hasProfile ? () => setDialog("renew") : undefined}
        onCorrect={
          canEdit && hasProfile ? () => setDialog("correct") : undefined
        }
        empty={
          isSelf
            ? {
                title: "Do you teach?",
                description:
                  "Set up your instructor profile with your instructor licence so you can be assigned to training.",
                action: setupButton,
              }
            : {
                title: "No instructor profile",
                description: `Set up ${user.fullName}'s instructor licence so they can be assigned to training.`,
                action: setupButton,
              }
        }
      />

      {hasProfile && (
        <VehicleClassSelectionCard
          title="Qualified classes"
          description={`${qualified.length} of ${permitted.length} classes the grade permits.`}
          classes={classes.data}
          permittedCodes={permitted}
          selectedCodes={qualified}
          hasLicence={detail.currentLicence !== null}
          canEdit={canEdit}
          editing={editingClasses}
          onEditingChange={setEditingClasses}
          hint={classHint === SETUP_HINT ? selfHint(isSelf) : classHint}
          onDismissHint={() => setClassHint(null)}
          save={saveClasses}
          legend={`Vehicle classes ${isSelf ? "you are" : `${user.fullName} is`} qualified to teach`}
          editNote="Teaching at a branch is also limited to the classes that branch offers."
          emptyConfirm={{
            title: "No qualified classes?",
            description: `${isSelf ? "You" : "They"} won't be assignable to any training until at least one class is ticked.`,
            confirm: "Save with no classes",
          }}
        />
      )}

      <InstructorBranchesCard
        branches={detail.branches}
        hasProfile={hasProfile}
      />

      <LicenceHistoryCard
        history={detail.licenceHistory}
        currentId={detail.currentLicence?.id}
      />

      <InstructorLicenceDialog
        mode={canEdit && hasProfile ? dialog : null}
        onOpenChange={(open) => !open && setDialog(null)}
        user={user}
        isSelf={isSelf}
        current={detail.currentLicence}
        selectedCodes={qualified}
        onSaved={onLicenceSaved}
        onPlanLimit={() => undefined}
      />
      {actions.dialogs}
    </>
  );
};
