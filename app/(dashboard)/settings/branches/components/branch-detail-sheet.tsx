"use client";

import { SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranch } from "@/hooks/branches/useBranches";
import { ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/dates";
import { formatLkPhone } from "@/lib/phone";
import { districtLabel } from "@/shared/constants/districts";
import { BranchStatusBadge } from "./branch-status-badge";

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="grid gap-1">
    <dt className="text-muted-foreground text-xs">{label}</dt>
    <dd className="text-sm break-words whitespace-pre-line">{children}</dd>
  </div>
);

const BranchDetail = ({ id }: { id: string }) => {
  const {
    data: branch,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useBranch(id);

  if (isPending) {
    return (
      <div className="grid gap-4 px-4" aria-busy="true">
        <SheetTitle className="sr-only">Loading branch</SheetTitle>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  // Unknown, another school's, or not accessible: all look the same.
  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <SearchXIcon className="text-muted-foreground size-6" aria-hidden />
        <SheetTitle>Branch not found</SheetTitle>
        <SheetDescription>
          This branch doesn&apos;t exist or you can&apos;t access it.
        </SheetDescription>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
        <SheetTitle>Couldn&apos;t load this branch</SheetTitle>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{branch.name}</SheetTitle>
        <SheetDescription>{districtLabel(branch.district)}</SheetDescription>
      </SheetHeader>
      <dl className="grid gap-4 px-4 pb-4">
        <Row label="Status">
          <BranchStatusBadge branch={branch} />
        </Row>
        <Row label="Address">{branch.address}</Row>
        <Row label="District">{districtLabel(branch.district)}</Row>
        <Row label="Phone">{formatLkPhone(branch.phone)}</Row>
        <Row label="Created">{formatDateTime(branch.createdAt)}</Row>
        <Row label="Last updated">{formatDateTime(branch.updatedAt)}</Row>
      </dl>
    </>
  );
};

/** Read-only branch details, opened via `?view=<id>` (deep-linkable). */
export const BranchDetailSheet = ({
  branchId,
  onOpenChange,
}: {
  branchId: string | null;
  onOpenChange: (open: boolean) => void;
}) => (
  <Sheet open={Boolean(branchId)} onOpenChange={onOpenChange}>
    <SheetContent className="w-full overflow-y-auto sm:max-w-md">
      {branchId && <BranchDetail key={branchId} id={branchId} />}
    </SheetContent>
  </Sheet>
);
