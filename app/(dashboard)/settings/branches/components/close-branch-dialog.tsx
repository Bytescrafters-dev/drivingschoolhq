"use client";

import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCloseBranch } from "@/hooks/branches/useBranchMutations";
import {
  getApiErrorMessage,
  isGloballyHandledError,
} from "@/lib/api/error-messages";
import type { BranchListItem, CloseBranchResponse } from "@/types/branch";

type Props = {
  branch: BranchListItem | null;
  onOpenChange: (open: boolean) => void;
  onClosed: (result: CloseBranchResponse) => void;
};

const CloseBranchContent = ({
  branch,
  onOpenChange,
  onClosed,
}: Props & { branch: BranchListItem }) => {
  const close = useCloseBranch();

  const onConfirm = () =>
    close.mutate(branch.id, {
      onSuccess: (result) => {
        onOpenChange(false);
        onClosed(result);
      },
      // Errors (incl. LAST_ACTIVE_BRANCH) stay inline; the dialog stays open.
    });

  const error =
    close.error && !isGloballyHandledError(close.error)
      ? getApiErrorMessage(close.error)
      : null;

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Close {branch.name}?</AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="grid gap-2">
            <p>
              Its records are kept and it can be reopened later. Staff whose
              default is {branch.name} will move to another branch.
            </p>
            <p className="text-foreground font-medium">
              Staff who work only in {branch.name} will be signed out and
              can&apos;t sign in until it reopens or they get another branch.
            </p>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircleIcon />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={close.isPending}>Cancel</AlertDialogCancel>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={close.isPending}
        >
          {close.isPending && <Loader2Icon className="animate-spin" />}
          Close branch
        </Button>
      </AlertDialogFooter>
    </>
  );
};

export const CloseBranchDialog = ({
  branch,
  onOpenChange,
  onClosed,
}: Props) => (
  <AlertDialog open={Boolean(branch)} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      {branch && (
        <CloseBranchContent
          key={branch.id}
          branch={branch}
          onOpenChange={onOpenChange}
          onClosed={onClosed}
        />
      )}
    </AlertDialogContent>
  </AlertDialog>
);
