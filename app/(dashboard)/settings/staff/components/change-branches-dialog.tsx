"use client";

import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChangeStaffBranches } from "@/hooks/staff/useStaffMutations";
import type { Staff, StaffOptions } from "@/types/staff";
import { BranchAccessField } from "./branch-access-field";
import {
  FormErrorAlert,
  SubmitButton,
  WithStaffOptions,
} from "./dialog-helpers";
import {
  branchAccessShape,
  refineBranchAccess,
  staffFieldError,
} from "./staff-form-schemas";

const schema = z.object(branchAccessShape).superRefine(refineBranchAccess);
type Form = z.infer<typeof schema>;
const FIELDS = ["branchIds"] as const;

const ChangeBranchesForm = ({
  staff,
  options,
  onDone,
}: {
  staff: Staff;
  options: StaffOptions;
  onDone: () => void;
}) => {
  const change = useChangeStaffBranches();
  const grantable = new Set(options.branches.map((b) => b.id));

  // Closed branches aren't offered; the backend keeps them on the person.
  const closedAssigned = staff.branches
    .filter((b) => b.status === "CLOSED")
    .map((b) => b.name);
  const selected = staff.branches
    .filter((b) => b.status === "ACTIVE" && grantable.has(b.id))
    .map((b) => b.id);
  const access =
    staff.branchAccess === "ALL" && options.canGrantAll ? "ALL" : "SELECTED";
  const defaultBranchId = (
    access === "ALL"
      ? grantable.has(staff.defaultBranchId)
      : selected.includes(staff.defaultBranchId)
  )
    ? staff.defaultBranchId
    : ((access === "ALL" ? options.branches[0]?.id : selected[0]) ?? "");

  const methods = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      branchAccess: access,
      branchIds: selected,
      defaultBranchId,
    },
  });

  const onSubmit = async (values: Form) => {
    try {
      await change.mutateAsync({
        id: staff.id,
        input: {
          branchAccess: values.branchAccess,
          branchIds: values.branchAccess === "SELECTED" ? values.branchIds : [],
          defaultBranchId: values.defaultBranchId,
        },
      });
      toast.success(`Branch access updated for ${staff.fullName}`);
      onDone();
    } catch (error) {
      const fieldError = staffFieldError(error, FIELDS);
      if (fieldError) {
        methods.setError(fieldError.field, { message: fieldError.message });
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="grid gap-5"
        noValidate
      >
        <BranchAccessField options={options} closedAssigned={closedAssigned} />
        <p className="text-muted-foreground text-xs">
          Applies immediately. If they lose the branch they&apos;re working in,
          their dashboard switches branch on their next action.
        </p>
        {!staffFieldError(change.error, FIELDS) && (
          <FormErrorAlert error={change.error} />
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <SubmitButton pending={change.isPending}>Save branches</SubmitButton>
        </DialogFooter>
      </form>
    </FormProvider>
  );
};

export const ChangeBranchesDialog = ({
  staff,
  onOpenChange,
}: {
  staff: Staff | null;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={Boolean(staff)} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Change branches</DialogTitle>
        <DialogDescription>{staff?.fullName}</DialogDescription>
      </DialogHeader>
      {staff && (
        <WithStaffOptions>
          {(options) => (
            <ChangeBranchesForm
              key={staff.id}
              staff={staff}
              options={options}
              onDone={() => onOpenChange(false)}
            />
          )}
        </WithStaffOptions>
      )}
    </DialogContent>
  </Dialog>
);
