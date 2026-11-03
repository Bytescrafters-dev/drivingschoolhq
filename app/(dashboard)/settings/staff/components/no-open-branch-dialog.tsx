"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Staff } from "@/types/staff";

/** After enabling someone whose branches are all closed: they still can't sign in. */
export const NoOpenBranchDialog = ({
  staff,
  onOpenChange,
  onChangeBranches,
}: {
  staff: Staff | null;
  onOpenChange: (open: boolean) => void;
  onChangeBranches: (staff: Staff) => void;
}) => (
  <AlertDialog open={Boolean(staff)} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{staff?.fullName} was enabled</AlertDialogTitle>
        <AlertDialogDescription>
          All of their branches are closed, so they still can&apos;t sign in.
          Give them an open branch so they can sign in.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Later</AlertDialogCancel>
        <AlertDialogAction onClick={() => staff && onChangeBranches(staff)}>
          Change branches
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
