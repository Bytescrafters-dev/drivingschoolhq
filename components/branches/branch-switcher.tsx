"use client";

import {
  CheckIcon,
  ChevronsUpDownIcon,
  MapPinIcon,
  StarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActiveBranch } from "@/components/branches/active-branch-provider";
import { useSetDefaultBranch } from "@/hooks/branches/useBranchMutations";
import {
  getApiErrorMessage,
  isGloballyHandledError,
} from "@/lib/api/error-messages";
import { districtLabel } from "@/shared/constants/districts";

/** Header dropdown for the tab's active branch. Switching is client-side only. */
export const BranchSwitcher = () => {
  const { branch, branches, setActiveBranch } = useActiveBranch();
  const setDefault = useSetDefaultBranch();

  if (!branch) return null;

  if (branches.length === 1) {
    return (
      <div className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
        <MapPinIcon
          className="text-muted-foreground size-4 shrink-0"
          aria-hidden
        />
        <span className="truncate">{branch.name}</span>
      </div>
    );
  }

  const makeDefault = () =>
    setDefault.mutate(branch.id, {
      onSuccess: () =>
        toast.success(`${branch.name} will open by default next time`),
      onError: (error) => {
        if (!isGloballyHandledError(error)) {
          toast.error(getApiErrorMessage(error));
        }
      },
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="max-w-56"
          aria-label={`Switch branch. Current branch: ${branch.name}`}
        >
          <MapPinIcon aria-hidden />
          <span className="truncate">{branch.name}</span>
          <ChevronsUpDownIcon className="opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch branch</DropdownMenuLabel>
        {branches.map((b) => (
          <DropdownMenuItem
            key={b.id}
            onSelect={() => setActiveBranch(b.id)}
            className="gap-2"
          >
            <CheckIcon
              className={b.id === branch.id ? "opacity-100" : "opacity-0"}
              aria-hidden
            />
            <div className="grid min-w-0 flex-1">
              <span className="truncate">{b.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {districtLabel(b.district)}
              </span>
            </div>
            {b.isDefault && (
              <StarIcon
                className="fill-current text-amber-500"
                aria-label="Default branch"
              />
            )}
          </DropdownMenuItem>
        ))}
        {!branch.isDefault && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={makeDefault}
              disabled={setDefault.isPending}
            >
              <StarIcon aria-hidden />
              Make {branch.name} my default
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
