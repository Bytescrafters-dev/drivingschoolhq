"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaffOptions } from "@/hooks/staff/useStaff";
import type { StaffOptions } from "@/types/staff";

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
