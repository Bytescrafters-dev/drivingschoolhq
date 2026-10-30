"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { useLogout } from "@/hooks/auth/useLogout";
import { useMe } from "@/hooks/my-profile/useProfile";

/** Signed-in user/school plus a way out, shown above the forced change form. */
export const ForceChangePasswordHeader = () => {
  const { data: me, isLoading } = useMe();
  const logout = useLogout();

  return (
    <div className="flex items-center gap-3 text-sm">
      {isLoading ? (
        <Skeleton className="h-4 w-32" />
      ) : me ? (
        <span className="text-muted-foreground truncate">
          {me.user.fullName} · {me.tenant.displayName}
        </span>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        <LogOutIcon />
        {logout.isPending ? "Logging out..." : "Log out"}
      </Button>
    </div>
  );
};

export const ForceChangePassword = ({ nextPath }: { nextPath: string }) => {
  const router = useRouter();

  const onSuccess = () => {
    toast.success("Password changed.");
    // The session continues; no need to sign in again.
    router.replace(nextPath);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          You signed in with a temporary password. Choose a new one to continue.
        </p>
      </div>
      <ChangePasswordForm
        currentPasswordLabel="Temporary password"
        submitLabel="Set new password"
        onSuccess={onSuccess}
      />
    </div>
  );
};
