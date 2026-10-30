"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/my-profile/useProfile";
import type { TenantRole } from "@/types/auth";

const ROLE_LABELS: Record<TenantRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  BRANCH_MANAGER: "Branch manager",
  FRONT_DESK: "Front desk",
  INSTRUCTOR: "Instructor",
  ACCOUNTANT: "Accountant",
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="grid gap-1 sm:grid-cols-3 sm:gap-4">
    <dt className="text-muted-foreground text-sm">{label}</dt>
    <dd className="text-sm font-medium break-words sm:col-span-2">{value}</dd>
  </div>
);

export const ProfileDetails = () => {
  const { data: me, isPending, isError, refetch, isFetching } = useMe();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Ask your school owner or admin to change these details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="grid gap-4" aria-label="Loading profile">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-start gap-2 text-sm">
            <p className="text-muted-foreground">
              Failed to load your profile.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Retry
            </Button>
          </div>
        ) : (
          <dl className="grid gap-4">
            <Row label="Name" value={me.user.fullName} />
            <Row label="Email" value={me.user.email} />
            <Row
              label="Role"
              value={ROLE_LABELS[me.user.role] ?? me.user.role}
            />
            <Row
              label="School"
              value={`${me.tenant.displayName} (${me.tenant.dsCode})`}
            />
          </dl>
        )}
      </CardContent>
    </Card>
  );
};
