"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { districtLabel } from "@/shared/constants/districts";
import type { StaffOptions } from "@/types/staff";
import type { BranchAccessValues } from "./staff-form-schemas";
import { FieldError, errorProps } from "@/components/common/field-error";

/**
 * ALL/SELECTED access, the branch checklist and the default branch.
 * Choices come only from `options` (what the signed-in user may grant).
 */
export const BranchAccessField = ({
  options,
  closedAssigned = [],
}: {
  options: StaffOptions;
  /** Names of the person's closed branches: kept by the backend, read-only. */
  closedAssigned?: string[];
}) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BranchAccessValues>();

  const branchAccess = watch("branchAccess");
  const branchIds = watch("branchIds");
  const defaultBranchId = watch("defaultBranchId");

  const defaultChoices =
    branchAccess === "ALL"
      ? options.branches
      : options.branches.filter((b) => branchIds.includes(b.id));

  // Keep the default valid whenever the choice changes (no effect needed).
  const syncDefault = (
    access: BranchAccessValues["branchAccess"],
    ids: string[],
  ) => {
    const allowed = access === "ALL" ? options.branches.map((b) => b.id) : ids;
    if (!allowed.includes(defaultBranchId)) {
      setValue("defaultBranchId", allowed[0] ?? "", { shouldValidate: false });
    }
  };

  const toggleBranch = (id: string, checked: boolean) => {
    const ordered = options.branches
      .map((b) => b.id)
      .filter((b) => (b === id ? checked : branchIds.includes(b)));
    setValue("branchIds", ordered, { shouldDirty: true, shouldValidate: true });
    syncDefault(branchAccess, ordered);
  };

  const branchError = errors.branchIds?.message;
  const defaultError = errors.defaultBranchId?.message;

  return (
    <fieldset className="grid gap-4">
      <legend className="mb-2 text-sm font-medium">Branch access</legend>

      {options.canGrantAll ? (
        <Controller
          control={control}
          name="branchAccess"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={(value) => {
                const access = value as BranchAccessValues["branchAccess"];
                field.onChange(access);
                syncDefault(access, branchIds);
              }}
              className="grid gap-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="ALL" id="access-all" />
                <Label htmlFor="access-all" className="font-normal">
                  All branches, including ones added later
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="SELECTED" id="access-selected" />
                <Label htmlFor="access-selected" className="font-normal">
                  Selected branches
                </Label>
              </div>
            </RadioGroup>
          )}
        />
      ) : (
        <p className="text-muted-foreground text-xs">
          You can give access to the branches you work in.
        </p>
      )}

      {branchAccess === "SELECTED" && (
        <div className="grid gap-2">
          <ul
            className="max-h-48 divide-y overflow-y-auto rounded-md border"
            aria-label="Branches"
            {...errorProps("staff-branchIds-error", branchError)}
          >
            {options.branches.map((b) => {
              const id = `branch-${b.id}`;
              return (
                <li key={b.id} className="flex items-center gap-3 px-3 py-2">
                  <Checkbox
                    id={id}
                    checked={branchIds.includes(b.id)}
                    onCheckedChange={(checked) =>
                      toggleBranch(b.id, checked === true)
                    }
                  />
                  <Label htmlFor={id} className="grid gap-0 font-normal">
                    <span>{b.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {districtLabel(b.district)}
                    </span>
                  </Label>
                </li>
              );
            })}
          </ul>
          {closedAssigned.length > 0 && (
            <p className="text-muted-foreground text-xs">
              Also assigned (closed): {closedAssigned.join(", ")}. Kept, and
              restored if the branch reopens.
            </p>
          )}
          <FieldError id="staff-branchIds-error" message={branchError} />
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="staff-defaultBranch">Default branch</Label>
        <Controller
          control={control}
          name="defaultBranchId"
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={defaultChoices.length === 0}
            >
              <SelectTrigger
                id="staff-defaultBranch"
                className="w-full"
                {...errorProps("staff-defaultBranch-error", defaultError)}
              >
                <SelectValue placeholder="Choose branches first" />
              </SelectTrigger>
              <SelectContent>
                {defaultChoices.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-muted-foreground text-xs">
          Where their dashboard opens after sign-in.
        </p>
        <FieldError id="staff-defaultBranch-error" message={defaultError} />
      </div>
    </fieldset>
  );
};
