"use client";

import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  ExternalLinkIcon,
  MoreHorizontalIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  UserCogIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AMBER_BADGE, daysLeftLabel } from "@/components/licences/expiry";
import { formatCalendarDate } from "@/lib/dates";
import { gradeLabel } from "@/shared/constants/grades";
import { instructorProfile } from "@/shared/constants/pageUrls";
import { roleLabel } from "@/shared/constants/roles";
import type { InstructorListItem, InstructorView } from "@/types/instructor";
import {
  ClassChips,
  ProfileStatusBadge,
  StaffDisabledBadge,
} from "@/components/instructors/instructor-badges";

const HEADERS = ["Name", "Status", "Grade", "Licence expiry", "Teaches here", ""];

export const InstructorsTableSkeleton = () => (
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
        {Array.from({ length: 4 }, (_, row) => (
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
    <span className="sr-only">Loading instructors</span>
  </div>
);

export type InstructorRowHandlers = {
  onSetup: (item: InstructorView) => void;
  onInactivate: (item: InstructorView) => void;
  onReactivate: (item: InstructorView) => void;
};

const RowActions = ({
  item,
  busy,
  onSetup,
  onInactivate,
  onReactivate,
}: InstructorRowHandlers & { item: InstructorListItem; busy: boolean }) => {
  const canSetup = item.canCreate && item.profileStatus === "SETUP_REQUIRED";
  const canInactivate =
    item.canChangeStatus && item.profileStatus === "ACTIVE";
  const canReactivate =
    item.canChangeStatus && item.profileStatus === "INACTIVE";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${item.user.fullName}`}
          disabled={busy}
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link href={instructorProfile(item.user.id)}>
            <ExternalLinkIcon />
            Open
          </Link>
        </DropdownMenuItem>
        {canSetup && (
          <DropdownMenuItem onSelect={() => onSetup(item)}>
            <UserCogIcon />
            Set up profile
          </DropdownMenuItem>
        )}
        {(canInactivate || canReactivate) && <DropdownMenuSeparator />}
        {canInactivate && (
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onInactivate(item)}
          >
            <PauseCircleIcon />
            Inactivate
          </DropdownMenuItem>
        )}
        {canReactivate && (
          <DropdownMenuItem onSelect={() => onReactivate(item)}>
            <PlayCircleIcon />
            Reactivate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type Props = InstructorRowHandlers & {
  items: InstructorListItem[];
  currentUserId: string | undefined;
  busyUserId: string | null;
};

export const InstructorsTable = ({
  items,
  currentUserId,
  busyUserId,
  ...handlers
}: Props) => {
  // A small, unpaginated list: rebuilding columns each render is fine.
  const columns: ColumnDef<InstructorListItem>[] = [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const { user } = row.original;
        return (
          <div className="grid gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={instructorProfile(user.id)}
                className="font-medium underline-offset-4 hover:underline"
              >
                {user.fullName}
              </Link>
              {user.id === currentUserId && <Badge>You</Badge>}
              {user.role !== "INSTRUCTOR" && (
                <Badge variant="outline">{roleLabel(user.role)}</Badge>
              )}
            </div>
            <span className="text-muted-foreground text-xs break-all">
              {user.email}
            </span>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const item = row.original;
        const disabled = item.user.status === "DISABLED";
        return (
          <div className="flex flex-col items-start gap-1">
            <div className="flex flex-wrap gap-1">
              <ProfileStatusBadge status={item.profileStatus} />
              {disabled && <StaffDisabledBadge />}
            </div>
            {disabled && item.profileStatus === "ACTIVE" && (
              <span className="text-muted-foreground max-w-48 text-xs">
                Still uses an instructor seat. Inactivate the profile to free
                it.
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "grade",
      header: "Grade",
      cell: ({ row }) => {
        const grade = row.original.profile?.grade;
        return grade ? (
          <span className="whitespace-nowrap">{gradeLabel(grade)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      id: "expiry",
      header: "Licence expiry",
      cell: ({ row }) => {
        const expiresOn = row.original.profile?.licenceExpiresOn;
        const warning = row.original.readiness.warnings[0];
        if (!expiresOn) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="whitespace-nowrap">
              {formatCalendarDate(expiresOn)}
            </span>
            {warning?.code === "INSTRUCTOR_LICENCE_EXPIRED" && (
              <Badge variant="destructive">Expired</Badge>
            )}
            {warning?.code === "INSTRUCTOR_LICENCE_EXPIRING" && (
              <Badge className={AMBER_BADGE}>
                Expires {daysLeftLabel(warning.daysLeft)}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "teaches",
      header: "Teaches here",
      cell: ({ row }) => {
        const item = row.original;
        if (!item.profile) {
          return <span className="text-muted-foreground">—</span>;
        }
        const qualified = item.qualifiedVehicleClasses.length;
        return (
          <div className="grid gap-1">
            <ClassChips codes={item.teachableHere} />
            <span className="text-muted-foreground text-xs">
              Qualified for {qualified} {qualified === 1 ? "class" : "classes"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <RowActions
            item={row.original}
            busy={busyUserId === row.original.user.id}
            {...handlers}
          />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.user.id,
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
