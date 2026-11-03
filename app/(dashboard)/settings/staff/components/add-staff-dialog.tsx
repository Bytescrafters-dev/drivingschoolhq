"use client";

import { useState } from "react";
import { z } from "zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMe } from "@/hooks/my-profile/useProfile";
import { useCreateStaff } from "@/hooks/staff/useStaffMutations";
import { getApiErrorCode } from "@/lib/api/error-messages";
import { generateTemporaryPassword } from "@/lib/temp-password";
import { roleLabel } from "@/shared/constants/roles";
import type { TenantRole } from "@/types/auth";
import type { Staff, StaffOptions } from "@/types/staff";
import { BranchAccessField } from "./branch-access-field";
import {
  FormErrorAlert,
  SubmitButton,
  WithStaffOptions,
} from "./dialog-helpers";
import { FieldError, errorProps } from "./field-error";
import { StaffDetailsFields } from "./staff-details-fields";
import {
  branchAccessShape,
  nicOrNull,
  phoneOrNull,
  refineBranchAccess,
  staffDetailsShape,
  staffFieldError,
  temporaryPasswordSchema,
} from "./staff-form-schemas";
import {
  copyWithToast,
  TemporaryPasswordField,
} from "./temporary-password-field";

const schema = z
  .object({
    ...staffDetailsShape,
    role: z.string().min(1, "Choose a role"),
    ...branchAccessShape,
    temporaryPassword: temporaryPasswordSchema,
  })
  .superRefine(refineBranchAccess);
type Form = z.infer<typeof schema>;

const FIELDS = ["email", "nic", "phone", "branchIds"] as const;

type Created = { staff: Staff; temporaryPassword: string };

const AddStaffForm = ({
  options,
  onCancel,
  onCreated,
  onPlanLimit,
}: {
  options: StaffOptions;
  onCancel: () => void;
  onCreated: (created: Created) => void;
  onPlanLimit: (message: string) => void;
}) => {
  const create = useCreateStaff();

  const methods = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      nic: "",
      role: "",
      branchAccess: "SELECTED",
      branchIds: [],
      defaultBranchId: "",
      temporaryPassword: generateTemporaryPassword(),
    },
  });
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = methods;

  const onSubmit = async (values: Form) => {
    try {
      const staff = await create.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        phone: phoneOrNull(values.phone),
        nic: nicOrNull(values.nic),
        role: values.role as TenantRole,
        branchAccess: values.branchAccess,
        ...(values.branchAccess === "SELECTED"
          ? { branchIds: values.branchIds }
          : {}),
        defaultBranchId: values.defaultBranchId,
        temporaryPassword: values.temporaryPassword,
      });
      onCreated({ staff, temporaryPassword: values.temporaryPassword });
    } catch (error) {
      if (getApiErrorCode(error) === "PLAN_LIMIT_REACHED") {
        onPlanLimit(error instanceof Error ? error.message : "");
        return;
      }
      const fieldError = staffFieldError(error, FIELDS);
      if (fieldError) {
        setError(fieldError.field, { message: fieldError.message });
      }
    }
  };

  const code = getApiErrorCode(create.error);
  const showAlert =
    code !== "PLAN_LIMIT_REACHED" && !staffFieldError(create.error, FIELDS);

  if (options.roles.length === 0 || options.branches.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        You can&apos;t add staff right now: there are no roles or open branches
        you can grant.
      </p>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        <StaffDetailsFields />

        <div className="grid gap-2">
          <Label htmlFor="staff-role">Role</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="staff-role"
                  className="w-full"
                  {...errorProps("staff-role-error", errors.role?.message)}
                >
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {options.roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError id="staff-role-error" message={errors.role?.message} />
        </div>

        <BranchAccessField options={options} />
        <TemporaryPasswordField />

        {showAlert && <FormErrorAlert error={create.error} />}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <SubmitButton pending={create.isPending}>Add staff</SubmitButton>
        </DialogFooter>
      </form>
    </FormProvider>
  );
};

const CreatedSummary = ({
  created,
  onDone,
}: {
  created: Created;
  onDone: () => void;
}) => {
  const { data: me } = useMe();
  const dsCode = me?.tenant.dsCode ?? "";
  const { staff, temporaryPassword } = created;

  const summary = [
    `Email: ${staff.email}`,
    `DS code: ${dsCode}`,
    `Temporary password: ${temporaryPassword}`,
  ].join("\n");

  return (
    <div className="grid gap-4">
      <p className="text-sm">
        Give {staff.fullName} their email, the school&apos;s DS code and the
        temporary password. They&apos;ll set their own password at first
        sign-in.
      </p>
      <dl className="bg-muted grid gap-3 rounded-md p-4 text-sm">
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground text-xs">Email</dt>
          <dd className="break-all">{staff.email}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground text-xs">DS code</dt>
          <dd className="font-mono">{dsCode}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground text-xs">Temporary password</dt>
          <dd className="font-mono break-all">{temporaryPassword}</dd>
        </div>
      </dl>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => copyWithToast(summary, "Sign-in details copied")}
        >
          <CopyIcon />
          Copy all
        </Button>
        <Button type="button" onClick={onDone}>
          Done
        </Button>
      </DialogFooter>
    </div>
  );
};

export const AddStaffDialog = ({
  open,
  onOpenChange,
  onPlanLimit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanLimit: (message: string) => void;
}) => {
  const [created, setCreated] = useState<Created | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) setCreated(null);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {created ? `${created.staff.fullName} was added` : "Add staff"}
          </DialogTitle>
          <DialogDescription>
            {created
              ? "Share these sign-in details with them."
              : "Create a sign-in for a staff member."}
          </DialogDescription>
        </DialogHeader>
        {open &&
          (created ? (
            <CreatedSummary
              created={created}
              onDone={() => handleOpenChange(false)}
            />
          ) : (
            <WithStaffOptions>
              {(options) => (
                <AddStaffForm
                  options={options}
                  onCancel={() => handleOpenChange(false)}
                  onCreated={setCreated}
                  onPlanLimit={(message) => {
                    handleOpenChange(false);
                    onPlanLimit(message);
                  }}
                />
              )}
            </WithStaffOptions>
          ))}
      </DialogContent>
    </Dialog>
  );
};
