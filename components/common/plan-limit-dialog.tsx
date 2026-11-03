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
 * A plan limit was hit (branches or staff seats). The backend decides; its
 * `message` contains the limit. Open while `message` is not null.
 */
export const PlanLimitDialog = ({
  title,
  description,
  message,
  onOpenChange,
}: {
  title: string;
  description: string;
  message: string | null;
  onOpenChange: (open: boolean) => void;
}) => (
  <AlertDialog open={message !== null} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="grid gap-2">
            <p>{description}</p>
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
