"use client";

import { useState } from "react";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useResetStaffPassword } from "@/hooks/staff/useStaffMutations";
import { generateTemporaryPassword } from "@/lib/temp-password";
import type { Staff } from "@/types/staff";
import { FormErrorAlert, SubmitButton } from "./dialog-helpers";
import { temporaryPasswordSchema } from "./staff-form-schemas";
import {
  copyWithToast,
  TemporaryPasswordField,
} from "./temporary-password-field";

const schema = z.object({ temporaryPassword: temporaryPasswordSchema });
type Form = z.infer<typeof schema>;

const ResetPasswordBody = ({
  staff,
  onDone,
}: {
  staff: Staff;
  onDone: () => void;
}) => {
  const reset = useResetStaffPassword();
  const [issued, setIssued] = useState<string | null>(null);
  const methods = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { temporaryPassword: generateTemporaryPassword() },
  });

  const onSubmit = (values: Form) =>
    reset.mutate(
      { id: staff.id, temporaryPassword: values.temporaryPassword },
      { onSuccess: () => setIssued(values.temporaryPassword) },
    );

  if (issued) {
    return (
      <div className="grid gap-4">
        <p className="text-sm">
          {staff.fullName} was signed out everywhere. Give them this temporary
          password; they&apos;ll choose a new one when they sign in.
        </p>
        <p className="bg-muted rounded-md p-4 font-mono text-sm break-all">
          {issued}
        </p>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => copyWithToast(issued, "Password copied")}
          >
            <CopyIcon />
            Copy
          </Button>
          <Button type="button" onClick={onDone}>
            Done
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
        <p className="text-muted-foreground text-sm">
          {staff.fullName} will be signed out everywhere and must change this
          password at their next sign-in.
        </p>
        <TemporaryPasswordField />
        <FormErrorAlert error={reset.error} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <SubmitButton pending={reset.isPending}>Reset password</SubmitButton>
        </DialogFooter>
      </form>
    </FormProvider>
  );
};

export const ResetPasswordDialog = ({
  staff,
  onOpenChange,
}: {
  staff: Staff | null;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={Boolean(staff)} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Reset password</DialogTitle>
        <DialogDescription>{staff?.fullName}</DialogDescription>
      </DialogHeader>
      {staff && (
        <ResetPasswordBody
          key={staff.id}
          staff={staff}
          onDone={() => onOpenChange(false)}
        />
      )}
    </DialogContent>
  </Dialog>
);
