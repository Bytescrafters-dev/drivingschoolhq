"use client";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateBranch,
  useUpdateBranch,
} from "@/hooks/branches/useBranchMutations";
import {
  getApiErrorCode,
  getApiErrorMessage,
  isGloballyHandledError,
} from "@/lib/api/error-messages";
import { normalizeLkPhone, toLocalPhone } from "@/lib/phone";
import { DISTRICTS, districtLabel } from "@/shared/constants/districts";
import type { Branch, BranchInput } from "@/types/branch";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .max(500, "Address must be at most 500 characters"),
  district: z.enum(DISTRICTS, { message: "Select a district" }),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .refine((v) => normalizeLkPhone(v) !== null, {
      message: "Enter a Sri Lankan number, e.g. 081 222 3333",
    }),
});
type Form = z.infer<typeof schema>;

/** Only the fields that differ from `branch` (edit sends changed fields only). */
const changedFields = (values: BranchInput, branch: Branch) => {
  const patch: Partial<BranchInput> = {};
  if (values.name !== branch.name) patch.name = values.name;
  if (values.address !== branch.address) patch.address = values.address;
  if (values.district !== branch.district) patch.district = values.district;
  if (values.phone !== branch.phone) patch.phone = values.phone;
  return patch;
};

type FormProps = {
  /** Present when editing. */
  branch?: Branch;
  onDone: () => void;
  onCreated: (branch: Branch) => void;
  onPlanLimit: (message: string) => void;
};

const BranchForm = ({ branch, onDone, onCreated, onPlanLimit }: FormProps) => {
  const isEdit = Boolean(branch);
  const create = useCreateBranch();
  const update = useUpdateBranch();
  const mutation = isEdit ? update : create;

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: branch
      ? {
          name: branch.name,
          address: branch.address,
          district: branch.district,
          phone: toLocalPhone(branch.phone),
        }
      : { name: "", address: "", phone: "" },
  });

  const onError = (error: unknown) => {
    switch (getApiErrorCode(error)) {
      case "BRANCH_NAME_TAKEN":
        setError("name", {
          message: "A branch with this name already exists",
        });
        return;
      case "INVALID_PHONE":
        setError("phone", { message: getApiErrorMessage(error) ?? "" });
        return;
      case "PLAN_LIMIT_REACHED":
        onPlanLimit(error instanceof Error ? error.message : "");
        onDone();
        return;
    }
    // Anything else is shown in the form's alert (via `mutation.error`).
  };

  const onSubmit = async (values: Form) => {
    const input: BranchInput = {
      ...values,
      phone: normalizeLkPhone(values.phone) ?? values.phone,
    };

    try {
      if (branch) {
        const patch = changedFields(input, branch);
        if (Object.keys(patch).length > 0) {
          await update.mutateAsync({ id: branch.id, patch });
        }
        onDone();
      } else {
        const created = await create.mutateAsync(input);
        onDone();
        onCreated(created);
      }
    } catch (error) {
      onError(error);
    }
  };

  const errorCode = getApiErrorCode(mutation.error);
  const showFormAlert =
    mutation.error &&
    !isGloballyHandledError(mutation.error) &&
    !["BRANCH_NAME_TAKEN", "INVALID_PHONE", "PLAN_LIMIT_REACHED"].includes(
      errorCode ?? "",
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="branch-name">Name</Label>
        <Input
          id="branch-name"
          autoComplete="off"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "branch-name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="branch-name-error" className="text-destructive text-xs">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="branch-address">Address</Label>
        <Textarea
          id="branch-address"
          rows={3}
          aria-invalid={errors.address ? true : undefined}
          aria-describedby={errors.address ? "branch-address-error" : undefined}
          {...register("address")}
        />
        {errors.address && (
          <p id="branch-address-error" className="text-destructive text-xs">
            {errors.address.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="branch-district">District</Label>
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  id="branch-district"
                  className="w-full"
                  aria-invalid={errors.district ? true : undefined}
                  aria-describedby={
                    errors.district ? "branch-district-error" : undefined
                  }
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder="Select a district" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {districtLabel(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.district && (
            <p id="branch-district-error" className="text-destructive text-xs">
              {errors.district.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="branch-phone">Phone</Label>
          <Input
            id="branch-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="081 222 3333"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "branch-phone-error" : undefined}
            {...register("phone")}
          />
          {errors.phone && (
            <p id="branch-phone-error" className="text-destructive text-xs">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {showFormAlert && (
        <Alert variant="destructive" role="alert">
          <AlertCircleIcon />
          <AlertTitle>{getApiErrorMessage(mutation.error)}</AlertTitle>
        </Alert>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2Icon className="animate-spin" />}
          {isEdit ? "Save changes" : "Create branch"}
        </Button>
      </DialogFooter>
    </form>
  );
};

type Props = Omit<FormProps, "onDone"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Create (no `branch`) or edit (with `branch`) a branch. */
export const BranchFormDialog = ({
  open,
  onOpenChange,
  branch,
  ...formProps
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {branch ? `Edit ${branch.name}` : "New branch"}
        </DialogTitle>
        <DialogDescription>
          {branch
            ? "Update the branch's details."
            : "Add a branch to your school."}
        </DialogDescription>
      </DialogHeader>
      {/* Keyed so each open starts from fresh values and mutation state. */}
      {open && (
        <BranchForm
          key={branch?.id ?? "new"}
          branch={branch}
          onDone={() => onOpenChange(false)}
          {...formProps}
        />
      )}
    </DialogContent>
  </Dialog>
);
