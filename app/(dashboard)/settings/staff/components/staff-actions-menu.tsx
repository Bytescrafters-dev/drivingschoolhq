"use client";

import {
  Building2Icon,
  KeyRoundIcon,
  MoreHorizontalIcon,
  PencilIcon,
  ShieldIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Staff } from "@/types/staff";

export type StaffActionHandlers = {
  onEdit: (staff: Staff) => void;
  onChangeRole: (staff: Staff) => void;
  onChangeBranches: (staff: Staff) => void;
  onResetPassword: (staff: Staff) => void;
  onDisable: (staff: Staff) => void;
  onEnable: (staff: Staff) => void;
};

/** Management actions; render only when `staff.canManage` (backend-decided). */
export const StaffActionsMenu = ({
  staff,
  busy,
  label = "Actions",
  ...handlers
}: StaffActionHandlers & {
  staff: Staff;
  busy?: boolean;
  /** Visible button text; the table uses an icon-only trigger. */
  label?: string | null;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      {label ? (
        <Button variant="outline" size="sm" disabled={busy}>
          {label}
          <MoreHorizontalIcon />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${staff.fullName}`}
          disabled={busy}
        >
          <MoreHorizontalIcon />
        </Button>
      )}
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-52">
      <DropdownMenuItem onSelect={() => handlers.onEdit(staff)}>
        <PencilIcon />
        Edit details
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => handlers.onChangeRole(staff)}>
        <ShieldIcon />
        Change role
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => handlers.onChangeBranches(staff)}>
        <Building2Icon />
        Change branches
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => handlers.onResetPassword(staff)}>
        <KeyRoundIcon />
        Reset password
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {staff.status === "ACTIVE" ? (
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => handlers.onDisable(staff)}
        >
          <UserXIcon />
          Disable
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem onSelect={() => handlers.onEnable(staff)}>
          <UserCheckIcon />
          Enable
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);
