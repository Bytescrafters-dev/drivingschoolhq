"use client";

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
import { useInstructor } from "@/hooks/instructors/useInstructors";
import { useDisableStaff } from "@/hooks/staff/useStaffMutations";
import type { Staff } from "@/types/staff";
import { FormErrorAlert } from "@/components/common/form-feedback";

const DisableBody = ({
  staff,
  onDone,
}: {
  staff: Staff;
  onDone: () => void;
}) => {
  const disable = useDisableStaff();
  // 404 = no instructor profile; only an ACTIVE one keeps a seat.
  const instructor = useInstructor(staff.id);
  const keepsInstructorSeat = instructor.data?.profileStatus === "ACTIVE";

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Disable {staff.fullName}?</AlertDialogTitle>
        <AlertDialogDescription>
          {staff.fullName} will be signed out immediately and can&apos;t sign
          in. Their history is kept. This frees a staff seat.
          {keepsInstructorSeat &&
            " Their instructor profile stays active and keeps its seat until you inactivate it."}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <FormErrorAlert error={disable.error} />
      <AlertDialogFooter>
        <AlertDialogCancel disabled={disable.isPending}>
          Cancel
        </AlertDialogCancel>
        <Button
          variant="destructive"
          disabled={disable.isPending}
          onClick={() =>
            disable.mutate(staff.id, {
              onSuccess: () => {
                toast.success(`${staff.fullName} was disabled`);
                onDone();
              },
            })
          }
        >
          {disable.isPending && <Loader2Icon className="animate-spin" />}
          Disable
        </Button>
      </AlertDialogFooter>
    </>
  );
};

export const DisableStaffDialog = ({
  staff,
  onOpenChange,
}: {
  staff: Staff | null;
  onOpenChange: (open: boolean) => void;
}) => (
  <AlertDialog open={Boolean(staff)} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      {staff && (
        <DisableBody
          key={staff.id}
          staff={staff}
          onDone={() => onOpenChange(false)}
        />
      )}
    </AlertDialogContent>
  </AlertDialog>
);
