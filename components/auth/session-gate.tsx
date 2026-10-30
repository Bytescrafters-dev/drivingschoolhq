"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertCircleIcon, Building2Icon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/auth/useLogout";
import { useMe } from "@/hooks/my-profile/useProfile";
import { ApiError } from "@/lib/api/client";
import { FORCE_CHANGE_PASSWORD } from "@/shared/constants/pageUrls";

const FullPageState = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-svh items-center justify-center p-6">
    <div className="flex max-w-sm flex-col items-center gap-3 text-center">
      {children}
    </div>
  </div>
);

const LoadingState = () => (
  <FullPageState>
    <Loader2Icon
      className="text-muted-foreground size-6 animate-spin"
      aria-hidden
    />
    <p className="text-muted-foreground text-sm" role="status">
      Loading your workspace…
    </p>
  </FullPageState>
);

const LogoutButton = () => {
  const logout = useLogout();
  return (
    <Button
      variant="outline"
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
    >
      {logout.isPending ? "Logging out..." : "Log out"}
    </Button>
  );
};

/**
 * Loads `/me` before rendering the dashboard shell:
 * - temporary password → forced change page;
 * - no accessible branch → blocking screen;
 * - otherwise renders the dashboard.
 * UX only: the backend enforces all of this on every request.
 */
export const SessionGate = ({ children }: { children: ReactNode }) => {
  const { data: me, isPending, isError, error, refetch, isFetching } = useMe();
  const router = useRouter();

  const mustChangePassword = me?.user.mustChangePassword === true;

  useEffect(() => {
    if (!mustChangePassword) return;
    const { pathname, search } = window.location;
    const params = new URLSearchParams({ next: `${pathname}${search}` });
    router.replace(`${FORCE_CHANGE_PASSWORD}?${params}`);
  }, [mustChangePassword, router]);

  // A 401 means `apiFetch` is already redirecting to login.
  const redirectingToLogin = error instanceof ApiError && error.status === 401;

  if (isPending || mustChangePassword || redirectingToLogin) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <FullPageState>
        <AlertCircleIcon className="text-destructive size-6" aria-hidden />
        <p className="font-medium">We couldn&apos;t load your account</p>
        <p className="text-muted-foreground text-sm">
          Check your connection and try again.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Retrying..." : "Retry"}
          </Button>
          <LogoutButton />
        </div>
      </FullPageState>
    );
  }

  if (me.branches.length === 0) {
    return (
      <FullPageState>
        <Building2Icon className="text-muted-foreground size-6" aria-hidden />
        <p className="font-medium">No branch access</p>
        <p className="text-muted-foreground text-sm">
          You are not assigned to any active branch. Contact your school admin.
        </p>
        <LogoutButton />
      </FullPageState>
    );
  }

  return <>{children}</>;
};
