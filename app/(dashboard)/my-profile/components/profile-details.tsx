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
import { roleLabel } from "@/shared/constants/roles";
import { ProfileEditForm } from "./profile-edit-form";

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="grid gap-1 sm:grid-cols-3 sm:gap-4">
    <dt className="text-muted-foreground text-sm">{label}</dt>
    <dd className="text-sm font-medium break-words sm:col-span-2">{value}</dd>
  </div>
);

export const ProfileDetails = () => {
  const { data: me, isPending, isError, refetch, isFetching } = useMe();

  if (isPending) {
    return (
      <Card>
        <CardContent className="grid gap-4" aria-label="Loading profile">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-2 text-sm">
          <p className="text-muted-foreground">Failed to load your profile.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isOwner = me.user.role === "OWNER";
  const access =
    me.user.branchAccess === "ALL"
      ? "All branches"
      : me.branches.map((b) => b.name).join(", ") || "—";

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>Update your name and phone number.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileEditForm
            key={`${me.user.fullName}|${me.user.phone ?? ""}`}
            fullName={me.user.fullName}
            phone={me.user.phone}
            phoneRequired={isOwner}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            {isOwner
              ? "To change your email or NIC, contact DrivingSchoolHQ support."
              : "Ask your school owner or admin to change your email or NIC."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            <Row label="Email" value={me.user.email} />
            <Row label="Role" value={roleLabel(me.user.role)} />
            <Row
              label="School"
              value={`${me.tenant.displayName} (${me.tenant.dsCode})`}
            />
            <Row label="Branch access" value={access} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};
