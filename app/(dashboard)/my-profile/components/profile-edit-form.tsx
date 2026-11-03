"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateMyProfile } from "@/hooks/my-profile/useProfile";
import {
  getApiErrorCode,
  getApiErrorMessage,
  isGloballyHandledError,
} from "@/lib/api/error-messages";
import { normalizeLkPhone, toLocalPhone } from "@/lib/phone";
import type { UpdateMyProfileInput } from "@/types/auth";

const PHONE_CODES = ["PHONE_REQUIRED", "INVALID_PHONE"];

const buildSchema = (phoneRequired: boolean) =>
  z.object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .max(200, "Full name must be at most 200 characters"),
    phone: z
      .string()
      .trim()
      .refine((v) => !phoneRequired || v !== "", {
        message: "The owner must keep a phone number",
      })
      .refine((v) => v === "" || normalizeLkPhone(v) !== null, {
        message: "Enter a Sri Lankan number, e.g. 077 123 4567",
      }),
  });
type Form = z.infer<ReturnType<typeof buildSchema>>;

/** Your own name and phone (`PATCH /tenant/me`). Sends only changed fields. */
export const ProfileEditForm = ({
  fullName,
  phone,
  phoneRequired,
}: {
  fullName: string;
  phone: string | null;
  /** Owners can't clear their phone (the backend also enforces this). */
  phoneRequired: boolean;
}) => {
  const update = useUpdateMyProfile();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<Form>({
    resolver: zodResolver(buildSchema(phoneRequired)),
    defaultValues: {
      fullName,
      phone: phone ? toLocalPhone(phone) : "",
    },
  });

  const onSubmit = async (values: Form) => {
    const patch: UpdateMyProfileInput = {};
    if (values.fullName !== fullName) patch.fullName = values.fullName;
    const nextPhone = values.phone ? normalizeLkPhone(values.phone) : null;
    if (nextPhone !== phone) patch.phone = nextPhone;
    if (Object.keys(patch).length === 0) return;

    try {
      await update.mutateAsync(patch);
      toast.success("Profile updated");
    } catch (error) {
      if (PHONE_CODES.includes(getApiErrorCode(error) ?? "")) {
        setError("phone", { message: getApiErrorMessage(error) ?? "" });
      }
    }
  };

  const formError =
    update.error &&
    !isGloballyHandledError(update.error) &&
    !PHONE_CODES.includes(getApiErrorCode(update.error) ?? "")
      ? getApiErrorMessage(update.error)
      : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="profile-fullName">Full name</Label>
        <Input
          id="profile-fullName"
          autoComplete="name"
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={
            errors.fullName ? "profile-fullName-error" : undefined
          }
          {...register("fullName")}
        />
        {errors.fullName && (
          <p id="profile-fullName-error" className="text-destructive text-xs">
            {errors.fullName.message}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile-phone">
          Phone
          {!phoneRequired && (
            <span className="text-muted-foreground"> (optional)</span>
          )}
        </Label>
        <Input
          id="profile-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="077 123 4567"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? "profile-phone-error" : undefined}
          {...register("phone")}
        />
        {errors.phone && (
          <p id="profile-phone-error" className="text-destructive text-xs">
            {errors.phone.message}
          </p>
        )}
      </div>
      {formError && (
        <Alert variant="destructive" role="alert">
          <AlertCircleIcon />
          <AlertTitle>{formError}</AlertTitle>
        </Alert>
      )}
      <div>
        <Button type="submit" disabled={update.isPending || !isDirty}>
          {update.isPending && <Loader2Icon className="animate-spin" />}
          Save
        </Button>
      </div>
    </form>
  );
};
