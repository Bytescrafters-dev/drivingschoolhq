"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CloseBranchResponse } from "@/types/branch";

/** Shown after closing a branch that was some staff members' only branch. */
export const LockedOutStaffDialog = ({
  result,
  onOpenChange,
}: {
  result: CloseBranchResponse | null;
  onOpenChange: (open: boolean) => void;
}) => (
  <AlertDialog open={Boolean(result)} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      {result && (
        <>
          <AlertDialogHeader>
            <AlertDialogTitle>{result.name} was closed</AlertDialogTitle>
            <AlertDialogDescription>
              These staff were signed out. Give them another branch in Staff, or
              reopen {result.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="max-h-64 divide-y overflow-y-auto rounded-md border text-sm">
            {result.lockedOutStaff.map((staff) => (
              <li key={staff.id} className="grid px-3 py-2">
                <span className="font-medium">{staff.fullName}</span>
                <span className="text-muted-foreground break-all">
                  {staff.email}
                </span>
              </li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </>
      )}
    </AlertDialogContent>
  </AlertDialog>
);
