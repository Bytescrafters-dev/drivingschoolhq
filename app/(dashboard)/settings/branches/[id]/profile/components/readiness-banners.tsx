import { AlertTriangleIcon, CircleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { daysLeftLabel } from "@/components/branches/branch-readiness-badges";
import { formatCalendarDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { BranchReadiness } from "@/types/branch";

const AMBER_ALERT =
  "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100 *:data-[slot=alert-description]:text-amber-900/90 dark:*:data-[slot=alert-description]:text-amber-100/90";

type Banner = {
  key: string;
  tone: "amber" | "red";
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
};

type Props = {
  readiness: BranchReadiness;
  /** Actions are shown only when set (managers on an open branch). */
  actions?: {
    onAddLicence: () => void;
    onEditClasses: () => void;
    onRenew: () => void;
  };
};

/** One banner per blocker/warning; several can show at once. */
export const ReadinessBanners = ({ readiness, actions }: Props) => {
  const banners: Banner[] = [];

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
        description: `The licence expires on ${formatCalendarDate(warning.expiresOn)} (${warning.daysLeft} ${warning.daysLeft === 1 ? "day" : "days"}).`,
        action: actions && { label: "Renew", onClick: actions.onRenew },
      });
    }
  }

  if (banners.length === 0) return null;

  return (
    <div className="grid gap-3">
      {banners.map((banner) => (
        <Alert
          key={banner.key}
          variant={banner.tone === "red" ? "destructive" : "default"}
          className={cn(
            banner.tone === "amber" && AMBER_ALERT,
            banner.tone === "red" && "border-destructive/50",
          )}
        >
          {banner.tone === "red" ? <CircleAlertIcon /> : <AlertTriangleIcon />}
          <AlertTitle>{banner.title}</AlertTitle>
          <AlertDescription>
            <p>{banner.description}</p>
            {banner.action && (
              <Button
                size="sm"
                variant="outline"
                className="mt-1"
                onClick={banner.action.onClick}
              >
                {banner.action.label}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
