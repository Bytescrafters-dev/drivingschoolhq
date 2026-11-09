import { AlertTriangleIcon, CircleAlertIcon, InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AMBER_ALERT } from "@/components/licences/expiry";
import { cn } from "@/lib/utils";

export type ReadinessBanner = {
  key: string;
  /** red: expired/disabled; amber: needs attention; muted: informational. */
  tone: "amber" | "red" | "muted";
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
};

const ICONS = {
  red: CircleAlertIcon,
  amber: AlertTriangleIcon,
  muted: InfoIcon,
};

/** Readiness blockers and warnings; several can show at once. */
export const ReadinessBannerList = ({
  banners,
}: {
  banners: ReadinessBanner[];
}) => {
  if (banners.length === 0) return null;

  return (
    <div className="grid gap-3">
      {banners.map((banner) => {
        const Icon = ICONS[banner.tone];
        return (
          <Alert
            key={banner.key}
            variant={banner.tone === "red" ? "destructive" : "default"}
            className={cn(
              banner.tone === "amber" && AMBER_ALERT,
              banner.tone === "red" && "border-destructive/50",
            )}
          >
            <Icon />
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
        );
      })}
    </div>
  );
};
