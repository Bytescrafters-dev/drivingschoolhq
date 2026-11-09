import { daysCount, daysLeftLabel } from "@/components/licences/expiry";
import {
  ReadinessBannerList,
  type ReadinessBanner,
} from "@/components/licences/readiness-banner-list";
import { formatCalendarDate } from "@/lib/dates";
import type { BranchReadiness } from "@/types/branch";

type Props = {
  readiness: BranchReadiness;
  /** Actions are shown only when set (managers on an open branch). */
  actions?: {
    onAddLicence: () => void;
    onEditClasses: () => void;
    onRenew: () => void;
  };
};

/** Branch readiness codes → banners. */
export const ReadinessBanners = ({ readiness, actions }: Props) => {
  const banners: ReadinessBanner[] = [];

  for (const blocker of readiness.blockers) {
    if (blocker.code === "BRANCH_LICENCE_MISSING") {
      banners.push({
        key: blocker.code,
        tone: "amber",
        title: "Licence missing",
        description:
          "Add this branch's driving-school licence to set its grade and vehicle classes.",
        action: actions && {
          label: "Add licence",
          onClick: actions.onAddLicence,
        },
      });
    } else {
      banners.push({
        key: blocker.code,
        tone: "amber",
        title: "No vehicle classes",
        description: "Choose at least one vehicle class this branch offers.",
        action: actions && {
          label: "Edit classes",
          onClick: actions.onEditClasses,
        },
      });
    }
  }

  for (const warning of readiness.warnings) {
    if (warning.code === "BRANCH_LICENCE_EXPIRED") {
      banners.push({
        key: warning.code,
        tone: "red",
        title: "Licence expired",
        description: `The licence expired on ${formatCalendarDate(warning.expiredOn)}. Record the renewed licence.`,
        action: actions && { label: "Renew", onClick: actions.onRenew },
      });
    } else {
      banners.push({
        key: warning.code,
        tone: "amber",
        title: `Licence expires ${daysLeftLabel(warning.daysLeft)}`,
        description: `The licence expires on ${formatCalendarDate(warning.expiresOn)} (${daysCount(warning.daysLeft)}).`,
        action: actions && { label: "Renew", onClick: actions.onRenew },
      });
    }
  }

  return <ReadinessBannerList banners={banners} />;
};
