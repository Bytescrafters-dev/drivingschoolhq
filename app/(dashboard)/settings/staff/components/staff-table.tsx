"use client";

import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
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
import { formatDateTime } from "@/lib/dates";
import { MY_PROFILE } from "@/shared/constants/pageUrls";
import type { Staff } from "@/types/staff";
import {
  StaffActionsMenu,
  type StaffActionHandlers,
} from "./staff-actions-menu";
import {
  StaffBranches,
  StaffFlags,
  StaffRoleBadge,
  StaffStatusBadge,
} from "./staff-badges";

const HEADERS = ["Name", "Role", "Branches", "Status", "Last login", ""];

export const StaffTableSkeleton = () => (
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
        {Array.from({ length: 5 }, (_, row) => (
          <TableRow key={row}>
            {HEADERS.map((_, col) => (
              <TableCell key={col}>
                <Skeleton className="h-5 w-full max-w-36" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <span className="sr-only">Loading staff</span>
  </div>
);

export const StaffTableError = ({
  onRetry,
  retrying,
}: {
  onRetry: () => void;
  retrying: boolean;
}) => (
  <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
    <p className="font-medium">Couldn&apos;t load staff</p>
    <p className="text-muted-foreground text-sm">
      Check your connection and try again.
    </p>
    <Button variant="outline" onClick={onRetry} disabled={retrying}>
      {retrying ? "Retrying..." : "Retry"}
    </Button>
  </div>
);

type Props = StaffActionHandlers & {
  staff: Staff[];
  selfId: string | undefined;
  hasFilters: boolean;
  busyStaffId: string | null;
  onView: (staff: Staff) => void;
};

export const StaffTable = ({
  staff,
  selfId,
  hasFilters,
  busyStaffId,
  onView,
  ...handlers
}: Props) => {
  // Few rows per page: rebuilding columns each render is fine.
  const columns: ColumnDef<Staff>[] = [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="grid min-w-48 gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="font-medium underline-offset-4 hover:underline"
                onClick={() => onView(s)}
              >
                {s.fullName}
              </button>
              {s.id === selfId && <Badge>You</Badge>}
            </div>
            <span className="text-muted-foreground text-xs break-all">
              {s.email}
            </span>
            <div className="flex flex-wrap gap-1">
              <StaffFlags staff={s} />
            </div>
          </div>
        );
      },
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => <StaffRoleBadge role={row.original.role} />,
    },
    {
      id: "branches",
      header: "Branches",
      cell: ({ row }) => <StaffBranches staff={row.original} />,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StaffStatusBadge status={row.original.status} />,
    },
    {
      id: "lastLogin",
      header: "Last login",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {row.original.lastLoginAt
            ? formatDateTime(row.original.lastLoginAt)
            : "Never"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const s = row.original;
        if (s.id === selfId) {
          return (
            <Button variant="link" size="sm" asChild>
              <Link href={MY_PROFILE}>My profile</Link>
            </Button>
          );
        }
        if (!s.canManage) return null;
        return (
          <div className="flex justify-end">
            <StaffActionsMenu
              staff={s}
              label={null}
              busy={busyStaffId === s.id}
              {...handlers}
            />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: staff,
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
                {hasFilters ? "No staff match these filters." : "No staff yet."}
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
