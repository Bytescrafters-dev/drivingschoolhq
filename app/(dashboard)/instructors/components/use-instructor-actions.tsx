"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
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
import { FormErrorAlert } from "@/components/common/form-feedback";
import { PlanLimitDialog } from "@/components/common/plan-limit-dialog";
import { useMe } from "@/hooks/my-profile/useProfile";
import {
  useInactivateInstructor,
  useReactivateInstructor,
} from "@/hooks/instructors/useInstructorMutations";
import {
  getApiErrorCode,
  getApiErrorMessage,
  isGloballyHandledError,
} from "@/lib/api/error-messages";
import type {
  InstructorDetail,
  InstructorUser,
  InstructorView,
} from "@/types/instructor";
import { InstructorLicenceDialog } from "./instructor-licence-dialog";

const InactivateBody = ({
  view,
  onDone,
}: {
  view: InstructorView;
  onDone: () => void;
}) => {
  const inactivate = useInactivateInstructor();
  const name = view.user.fullName;

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Inactivate {name}&apos;s instructor profile?</AlertDialogTitle>
        <AlertDialogDescription>
          They won&apos;t be assignable to new training; their instructor seat is
          freed. Their licence, classes and history are kept, and you can
          reactivate them later. Their staff account isn&apos;t affected.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <FormErrorAlert error={inactivate.error} />
      <AlertDialogFooter>
        <AlertDialogCancel disabled={inactivate.isPending}>
          Cancel
        </AlertDialogCancel>
        <Button
          variant="destructive"
          disabled={inactivate.isPending}
          onClick={() =>
            inactivate.mutate(view.user.id, {
              onSuccess: () => {
                toast.success(`${name}'s instructor profile is inactive`);
                onDone();
              },
              onError: (error) => {
                if (isGloballyHandledError(error)) onDone();
              },
            })
          }
        >
          {inactivate.isPending && <Loader2Icon className="animate-spin" />}
          Inactivate
        </Button>
      </AlertDialogFooter>
    </>
  );
};

const PLAN_LIMIT_COPY = {
  title: "Instructor limit reached",
  description:
    "Your plan's instructor limit is reached. Inactivate an instructor or upgrade the plan.",
};

/**
 * Setup, inactivate and reactivate, shared by the list and the profile page.
 * Render `dialogs` once; actions are gated by the item's flags by the caller.
 */
export const useInstructorActions = ({
  onSetupDone,
}: {
  /** After a profile was created (e.g. open it in class-edit mode). */
  onSetupDone: (detail: InstructorDetail) => void;
}) => {
  const { data: me } = useMe();
  const [setupUser, setSetupUser] = useState<InstructorUser | null>(null);
  const [inactivating, setInactivating] = useState<InstructorView | null>(
    null,
  );
  const [planLimit, setPlanLimit] = useState<string | null>(null);
  const reactivateMutation = useReactivateInstructor();

  const reactivate = (view: InstructorView) =>
    reactivateMutation.mutate(view.user.id, {
      onSuccess: () =>
        toast.success(`${view.user.fullName}'s instructor profile is active`),
      onError: (error) => {
        const code = getApiErrorCode(error);
        if (code === "PLAN_LIMIT_REACHED") setPlanLimit(error.message);
        else if (!isGloballyHandledError(error)) {
          toast.error(getApiErrorMessage(error));
        }
      },
    });

  const busyUserId = reactivateMutation.isPending
    ? (reactivateMutation.variables ?? null)
    : null;

  const dialogs = (
    <>
      <InstructorLicenceDialog
        mode={setupUser ? "first" : null}
        onOpenChange={(open) => !open && setSetupUser(null)}
        user={setupUser ?? { id: "", fullName: "" }}
        isSelf={setupUser?.id === me?.user.id}
        current={null}
        selectedCodes={[]}
        onSaved={({ response }) => {
          toast.success("Instructor profile set up", {
            description:
              response.user.id === me?.user.id
                ? "Untick the classes you don't teach."
                : "Untick the classes they don't teach.",
          });
          onSetupDone(response);
        }}
        onPlanLimit={setPlanLimit}
      />
      <AlertDialog
        open={inactivating !== null}
        onOpenChange={(open) => !open && setInactivating(null)}
      >
        <AlertDialogContent>
          {inactivating && (
            <InactivateBody
              key={inactivating.user.id}
              view={inactivating}
              onDone={() => setInactivating(null)}
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
      <PlanLimitDialog
        {...PLAN_LIMIT_COPY}
        message={planLimit}
        onOpenChange={(open) => !open && setPlanLimit(null)}
      />
    </>
  );

  return {
    openSetup: setSetupUser,
    openInactivate: setInactivating,
    reactivate,
    busyUserId,
    dialogs,
  };
};
