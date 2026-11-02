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

/**
 * Create/reopen hit the plan's ACTIVE-branch limit. The backend decides;
 * its `message` contains the limit.
 */
export const PlanLimitDialog = ({
  message,
  onOpenChange,
}: {
  message: string | null;
  onOpenChange: (open: boolean) => void;
}) => (
  <AlertDialog open={message !== null} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Branch limit reached</AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="grid gap-2">
            <p>
              Your plan&apos;s branch limit is reached. Close a branch or
              contact DrivingSchoolHQ to upgrade.
            </p>
            {message && <p className="text-xs">{message}</p>}
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction>OK</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
