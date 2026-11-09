import { daysCount, daysLeftLabel } from "@/components/licences/expiry";
import {
  ReadinessBannerList,
  type ReadinessBanner,
} from "@/components/licences/readiness-banner-list";
import { formatCalendarDate } from "@/lib/dates";
import type { InstructorDetail } from "@/types/instructor";

type Actions = {
  onSetup: () => void;
  onEditClasses: () => void;
  onRenew: () => void;
  onInactivate: () => void;
  onReactivate: () => void;
};

/** Instructor readiness codes → banners. Actions follow the item's flags. */
export const InstructorReadinessBanners = ({
  detail,
  isSelf,
  actions,
}: {
  detail: InstructorDetail;
  isSelf: boolean;
  actions: Actions;
}) => {
  const { readiness, canCreate, canEdit, canChangeStatus } = detail;
  const they = isSelf ? "you" : "they";
  const banners: ReadinessBanner[] = [];

  for (const blocker of readiness.blockers) {
    switch (blocker.code) {
      case "INSTRUCTOR_SETUP_REQUIRED":
        banners.push({
          key: blocker.code,
          tone: "amber",
          title: "Instructor profile not set up",
          description: `Record ${isSelf ? "your" : "their"} instructor licence so ${they} can be assigned to training.`,
          action: canCreate
            ? { label: "Set up profile", onClick: actions.onSetup }
            : undefined,
        });
        break;
      case "STAFF_DISABLED":
        banners.push({
          key: blocker.code,
          tone: "red",
          title: "Staff account disabled",
          description:
            detail.profileStatus === "ACTIVE"
              ? "They can't sign in or be assigned. Their instructor profile is still active and keeps its seat; inactivate it to free the seat."
              : "They can't sign in or be assigned. Enable the staff account in Settings → Staff first.",
          action:
            canChangeStatus && detail.profileStatus === "ACTIVE"
              ? { label: "Inactivate profile", onClick: actions.onInactivate }
              : undefined,
        });
        break;
      case "INSTRUCTOR_INACTIVE":
        banners.push({
          key: blocker.code,
          tone: "muted",
          title: "Instructor profile inactive",
          description: `${isSelf ? "You" : "They"} can't be assigned to new training. Reactivating uses an instructor seat.`,
          action: canChangeStatus
            ? { label: "Reactivate", onClick: actions.onReactivate }
            : undefined,
        });
        break;
      case "NO_QUALIFIED_VEHICLE_CLASSES":
        banners.push({
          key: blocker.code,
          tone: "amber",
          title: "No qualified classes",
          description: `Choose at least one vehicle class ${they} teach.`,
          action: canEdit
            ? { label: "Edit classes", onClick: actions.onEditClasses }
            : undefined,
        });
        break;
    }
  }

  const renew = canEdit
    ? { label: "Renew", onClick: actions.onRenew }
    : undefined;
  for (const warning of readiness.warnings) {
    if (warning.code === "INSTRUCTOR_LICENCE_EXPIRED") {
      banners.push({
        key: warning.code,
        tone: "red",
        title: "Instructor licence expired",
        description: `The licence expired on ${formatCalendarDate(warning.expiredOn)}. Record the renewed licence. Nothing is blocked.`,
        action: renew,
      });
    } else {
      banners.push({
        key: warning.code,
        tone: "amber",
        title: `Instructor licence expires ${daysLeftLabel(warning.daysLeft)}`,
        description: `The licence expires on ${formatCalendarDate(warning.expiresOn)} (${daysCount(warning.daysLeft)}).`,
        action: renew,
      });
    }
  }

  return <ReadinessBannerList banners={banners} />;
};
