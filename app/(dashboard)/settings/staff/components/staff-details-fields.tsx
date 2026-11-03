"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StaffDetailsValues } from "./staff-form-schemas";
import { FieldError, errorProps } from "./field-error";

/** Name, email, phone and NIC. Used by Add staff and Edit details. */
export const StaffDetailsFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<StaffDetailsValues>();

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="staff-fullName">Full name</Label>
        <Input
          id="staff-fullName"
          autoComplete="off"
          {...errorProps("staff-fullName-error", errors.fullName?.message)}
          {...register("fullName")}
        />
        <FieldError
          id="staff-fullName-error"
          message={errors.fullName?.message}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="staff-email">Email</Label>
        <Input
          id="staff-email"
          type="email"
          autoComplete="off"
          {...errorProps("staff-email-error", errors.email?.message)}
          {...register("email")}
        />
        <p className="text-muted-foreground text-xs">
          This is the address they sign in with.
        </p>
        <FieldError id="staff-email-error" message={errors.email?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid content-start gap-2">
          <Label htmlFor="staff-phone">
            Phone <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="staff-phone"
            type="tel"
            inputMode="tel"
            placeholder="077 123 4567"
            {...errorProps("staff-phone-error", errors.phone?.message)}
            {...register("phone")}
          />
          <FieldError id="staff-phone-error" message={errors.phone?.message} />
        </div>
        <div className="grid content-start gap-2">
          <Label htmlFor="staff-nic">
            NIC <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="staff-nic"
            autoCapitalize="characters"
            spellCheck={false}
            {...errorProps("staff-nic-error", errors.nic?.message)}
            {...register("nic")}
          />
          <FieldError id="staff-nic-error" message={errors.nic?.message} />
        </div>
      </div>
    </>
  );
};
