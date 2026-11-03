"use client";

import type { ReactNode } from "react";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaffOptions } from "@/hooks/staff/useStaff";
import {
  getApiErrorMessage,
  isGloballyHandledError,
} from "@/lib/api/error-messages";
import type { StaffOptions } from "@/types/staff";

/** Inline alert for errors that aren't field errors or handled app-wide. */
export const FormErrorAlert = ({ error }: { error: unknown }) => {
  if (!error || isGloballyHandledError(error)) return null;
  return (
    <Alert variant="destructive" role="alert">
      <AlertCircleIcon />
      <AlertTitle>{getApiErrorMessage(error)}</AlertTitle>
    </Alert>
  );
};

export const SubmitButton = ({
  pending,
  disabled = false,
  children,
  variant,
}: {
  pending: boolean;
  disabled?: boolean;
  children: ReactNode;
  variant?: "default" | "destructive";
}) => (
  <Button type="submit" disabled={pending || disabled} variant={variant}>
    {pending && <Loader2Icon className="animate-spin" />}
    {children}
  </Button>
);

/**
 * Loads `GET /tenant/staff/options` (fresh each time a form opens) and renders
 * `children` with it. Forms only offer what the backend says may be granted.
 */
export const WithStaffOptions = ({
  children,
}: {
  children: (options: StaffOptions) => ReactNode;
}) => {
  const { data, isPending, isError, refetch, isFetching } =
    useStaffOptions(true);

  if (isPending) {
    return (
      <div className="grid gap-4" aria-busy="true">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
        <span className="sr-only">Loading</span>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-start gap-2 text-sm">
        <p className="text-muted-foreground">Couldn&apos;t load the options.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Retry
        </Button>
      </div>
    );
  }
  return <>{children(data)}</>;
};
