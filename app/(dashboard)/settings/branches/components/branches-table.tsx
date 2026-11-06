"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BranchReadinessBadges } from "@/components/branches/branch-readiness-badges";
import { districtLabel } from "@/shared/constants/districts";
import { gradeLabel } from "@/shared/constants/grades";
import { formatLkPhone } from "@/lib/phone";
import { summariseCodes } from "@/lib/vehicle-classes";
import type { BranchListItem } from "@/types/branch";
import { BranchStatusBadge } from "./branch-status-badge";
import { BranchRowActions, type BranchRowHandlers } from "./branch-row-actions";

const LAST_ACTIVE_REASON = "A school must keep at least one active branch.";
const HEADERS = ["Name", "District", "Phone", "Grade", "Classes", "Status", ""];

export const BranchesTableSkeleton = () => (
  <div className="overflow-hidden rounded-lg border" aria-busy="true">
    <Table>
      <TableHeader className="bg-muted">
        <TableRow>
          {HEADERS.map((h, i) => (
            <TableHead key={i}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }, (_, row) => (
          <TableRow key={row}>
            {HEADERS.map((_, col) => (
              <TableCell key={col}>
                <Skeleton className="h-5 w-full max-w-40" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <span className="sr-only">Loading branches</span>
  </div>
);

type Props = BranchRowHandlers & {
  branches: BranchListItem[];
  activeBranchId: string | undefined;
  /** Ids from `me.branches` (ACTIVE branches the user can switch to). */
  workableBranchIds: Set<string>;
  canManage: boolean;
  /** `me.user.branchAccess === 'ALL'`: the user sees every branch. */
  seesAllBranches: boolean;
  busyBranchId: string | null;
};

export const BranchesTable = ({
  branches,
  activeBranchId,
  workableBranchIds,
  canManage,
  seesAllBranches,
  busyBranchId,
  ...handlers
}: Props) => {
  // Only safe to pre-empt LAST_ACTIVE_BRANCH when the user sees every branch;
  // a SELECTED admin may not see the others (the backend 409 still applies).
  const activeCount = branches.filter((b) => b.status === "ACTIVE").length;
  const closeDisabledReason =
    seesAllBranches && activeCount <= 1 ? LAST_ACTIVE_REASON : null;

  // A handful of rows: rebuilding columns each render is cheaper than
  // memoising around the handler props.
  const columns: ColumnDef<BranchListItem>[] = [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="font-medium underline-offset-4 hover:underline"
              onClick={() => handlers.onView(b)}
            >
              {b.name}
            </button>
            {b.isDefault && (
              <Badge variant="outline">
                <StarIcon className="fill-current text-amber-500" aria-hidden />
                Default
              </Badge>
            )}
            {b.id === activeBranchId && <Badge>Current</Badge>}
          </div>
        );
      },
    },
    {
      id: "district",
      header: "District",
      cell: ({ row }) => districtLabel(row.original.district),
    },
    {
      id: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums">
          {formatLkPhone(row.original.phone)}
        </span>
      ),
    },
    {
      id: "grade",
      header: "Grade",
      cell: ({ row }) => {
        const { grade } = row.original.profile;
        return grade ? (
          <span className="whitespace-nowrap">{gradeLabel(grade)}</span>
        ) : (
          <span className="text-muted-foreground whitespace-nowrap">
            Not set
          </span>
        );
      },
    },
    {
      id: "classes",
      header: "Classes",
      cell: ({ row }) => {
        const codes = row.original.profile.offeredVehicleClasses;
        return codes.length > 0 ? (
          <span className="whitespace-nowrap" title={codes.join(", ")}>
            {summariseCodes(codes)}
          </span>
        ) : (
          <span className="text-muted-foreground">None</span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <BranchStatusBadge branch={row.original} />
          <BranchReadinessBadges readiness={row.original.profile.readiness} />
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex justify-end">
            <BranchRowActions
              branch={b}
              canManage={canManage}
              canSwitch={
                b.status === "ACTIVE" &&
                b.id !== activeBranchId &&
                workableBranchIds.has(b.id)
              }
              closeDisabledReason={closeDisabledReason}
              busy={busyBranchId === b.id}
              {...handlers}
            />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: branches,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-muted-foreground h-24 text-center"
              >
                No branches to show.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

/** Error state with retry, shared by the list. */
export const BranchesTableError = ({
  onRetry,
  retrying,
}: {
  onRetry: () => void;
  retrying: boolean;
}) => (
  <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
    <p className="font-medium">Couldn&apos;t load branches</p>
    <p className="text-muted-foreground text-sm">
      Check your connection and try again.
    </p>
    <Button variant="outline" onClick={onRetry} disabled={retrying}>
      {retrying ? "Retrying..." : "Retry"}
    </Button>
  </div>
);
