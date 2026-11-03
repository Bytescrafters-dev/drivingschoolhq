"use client";

import { useState } from "react";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateStaff } from "@/hooks/staff/useStaffMutations";
import { toLocalPhone } from "@/lib/phone";
import type { Staff, UpdateStaffInput } from "@/types/staff";
import { FormErrorAlert, SubmitButton } from "./dialog-helpers";
import { StaffDetailsFields } from "./staff-details-fields";
import {
  nicOrNull,
  phoneOrNull,
  staffDetailsShape,
  staffFieldError,
} from "./staff-form-schemas";

const schema = z.object(staffDetailsShape);
type Form = z.infer<typeof schema>;
const FIELDS = ["email", "nic", "phone"] as const;

/** Only changed fields; "" clears phone/NIC (sent as null). */
const changedFields = (values: Form, staff: Staff): UpdateStaffInput => {
  const patch: UpdateStaffInput = {};
  if (values.fullName !== staff.fullName) patch.fullName = values.fullName;
  if (values.email.toLowerCase() !== staff.email.toLowerCase()) {
    patch.email = values.email;
  }
  const phone = phoneOrNull(values.phone);
  if (phone !== staff.phone) patch.phone = phone;
  const nic = nicOrNull(values.nic);
  if (nic !== staff.nic) patch.nic = nic;
  return patch;
};

const EditDetailsForm = ({
  staff,
  onDone,
}: {
  staff: Staff;
  onDone: () => void;
}) => {
  const update = useUpdateStaff();
  // Changing the email signs the person out, so confirm it first.
  const [pendingPatch, setPendingPatch] = useState<UpdateStaffInput | null>(
    null,
  );

  const methods = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone ? toLocalPhone(staff.phone) : "",
      nic: staff.nic ?? "",
    },
  });

  const save = async (patch: UpdateStaffInput) => {
    try {
      await update.mutateAsync({ id: staff.id, patch });
      onDone();
    } catch (error) {
      setPendingPatch(null);
      const fieldError = staffFieldError(error, FIELDS);
      if (fieldError) {
        methods.setError(fieldError.field, { message: fieldError.message });
      }
    }
  };

  const onSubmit = (values: Form) => {
    const patch = changedFields(values, staff);
    if (Object.keys(patch).length === 0) return onDone();
    if (patch.email !== undefined) return setPendingPatch(patch);
    return save(patch);
  };

  if (pendingPatch) {
    return (
      <div className="grid gap-4">
        <Alert>
          <AlertTitle>
            {staff.fullName} will need to sign in again with the new email (
            {pendingPatch.email}).
          </AlertTitle>
        </Alert>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPendingPatch(null)}
            disabled={update.isPending}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={() => save(pendingPatch)}
            disabled={update.isPending}
          >
            Change email and save
          </Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="grid gap-5"
        noValidate
      >
        <StaffDetailsFields />
        {!staffFieldError(update.error, FIELDS) && (
          <FormErrorAlert error={update.error} />
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <SubmitButton pending={update.isPending}>Save changes</SubmitButton>
        </DialogFooter>
      </form>
    </FormProvider>
  );
};

export const EditStaffDetailsDialog = ({
  staff,
  onOpenChange,
}: {
  staff: Staff | null;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={Boolean(staff)} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit details</DialogTitle>
        <DialogDescription>{staff?.fullName}</DialogDescription>
      </DialogHeader>
      {staff && (
        <EditDetailsForm
          key={staff.id}
          staff={staff}
          onDone={() => onOpenChange(false)}
        />
      )}
    </DialogContent>
  </Dialog>
);
