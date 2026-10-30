"use client";

import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMe } from "@/hooks/my-profile/useProfile";

const COPY = {
  GRACE_PERIOD: {
    title: "Subscription in grace period",
    description:
      "Your school's subscription needs attention. Ask your school owner to contact DrivingSchoolHQ support to avoid interruption.",
  },
  SUSPENDED: {
    title: "Account suspended",
    description:
      "Your school's account is suspended and some actions may be unavailable. Ask your school owner to contact DrivingSchoolHQ support.",
  },
} as const;

/** Banner for tenants whose access is restricted. Suspended tenants can still sign in. */
export const TenantAccessBanner = () => {
  const { data: me } = useMe();
  const status = me?.tenant.accessStatus;
  if (status !== "GRACE_PERIOD" && status !== "SUSPENDED") return null;

  const copy = COPY[status];
  return (
    <div className="px-4 pt-4 lg:px-6">
      <Alert variant={status === "SUSPENDED" ? "destructive" : "default"}>
        <AlertTriangleIcon />
        <AlertTitle>{copy.title}</AlertTitle>
        <AlertDescription>{copy.description}</AlertDescription>
      </Alert>
    </div>
  );
};
