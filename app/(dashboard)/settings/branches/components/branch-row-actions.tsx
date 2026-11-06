"use client";

import Link from "next/link";
import {
  ArrowRightLeftIcon,
  EyeIcon,
  FileBadgeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RotateCcwIcon,
  StarIcon,
  XCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { settingsBranchProfile } from "@/shared/constants/pageUrls";
import type { BranchListItem } from "@/types/branch";

export type BranchRowHandlers = {
  onView: (branch: BranchListItem) => void;
  onSwitch: (branch: BranchListItem) => void;
  onMakeDefault: (branch: BranchListItem) => void;
  onEdit: (branch: BranchListItem) => void;
  onClose: (branch: BranchListItem) => void;
  onReopen: (branch: BranchListItem) => void;
};

type Props = BranchRowHandlers & {
  branch: BranchListItem;
  canManage: boolean;
  /** Active, workable and not already this tab's branch. */
  canSwitch: boolean;
  /** Set when Close must be disabled; the reason is shown on the item. */
  closeDisabledReason: string | null;
  busy: boolean;
};

export const BranchRowActions = ({
  branch,
  canManage,
  canSwitch,
  closeDisabledReason,
  busy,
  onView,
  onSwitch,
  onMakeDefault,
  onEdit,
  onClose,
  onReopen,
}: Props) => {
  const isActive = branch.status === "ACTIVE";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${branch.name}`}
          disabled={busy}
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onSelect={() => onView(branch)}>
          <EyeIcon />
          View
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={settingsBranchProfile(branch.id)}>
            <FileBadgeIcon />
            Profile
          </Link>
        </DropdownMenuItem>
        {canSwitch && (
          <DropdownMenuItem onSelect={() => onSwitch(branch)}>
            <ArrowRightLeftIcon />
            Switch to this branch
          </DropdownMenuItem>
        )}
        {isActive && !branch.isDefault && (
          <DropdownMenuItem onSelect={() => onMakeDefault(branch)}>
            <StarIcon />
            Make default
          </DropdownMenuItem>
        )}
        {canManage && (
          <>
            <DropdownMenuSeparator />
            {isActive ? (
              <>
                <DropdownMenuItem onSelect={() => onEdit(branch)}>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
                {closeDisabledReason ? (
                  // Reason shown inline (not a tooltip) so keyboard and
                  // touch users can read it on the disabled item.
                  <DropdownMenuItem disabled className="items-start">
                    <XCircleIcon className="mt-0.5" />
                    <div className="grid gap-0.5">
                      <span>Close</span>
                      <span className="text-muted-foreground text-xs">
                        {closeDisabledReason}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => onClose(branch)}
                  >
                    <XCircleIcon />
                    Close
                  </DropdownMenuItem>
                )}
              </>
            ) : (
              <DropdownMenuItem onSelect={() => onReopen(branch)}>
                <RotateCcwIcon />
                Reopen
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
