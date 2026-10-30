"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import PasswordInput from "@/components/common/PasswordInput";
import { useChangePassword } from "@/hooks/my-profile/useProfile";
import { getApiErrorMessage } from "@/lib/api/error-messages";

const schema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .max(128, "Password is too long"),
    newPassword: z
      .string()
      .min(12, "New password must be at least 12 characters")
      .max(128, "New password must be at most 128 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "Choose a password different from your current one",
    path: ["newPassword"],
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type Form = z.infer<typeof schema>;

/**
 * Change-password form used by the forced change page and the profile page.
 * The current session continues after success.
 */
export const ChangePasswordForm = ({
  currentPasswordLabel = "Current password",
  submitLabel = "Change password",
  onSuccess,
}: {
  currentPasswordLabel?: string;
  submitLabel?: string;
  onSuccess: () => void;
}) => {
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async ({ currentPassword, newPassword }: Form) => {
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
    } catch {
      return; // Surfaced via `changePassword.error`.
    }
    reset();
    onSuccess();
  };

  const errorMessage = getApiErrorMessage(changePassword.error);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      <div className="grid gap-3">
        <Label htmlFor="currentPassword">{currentPasswordLabel}</Label>
        <PasswordInput
          id="currentPassword"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="newPassword">New password</Label>
        <PasswordInput
          id="newPassword"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        {!errors.newPassword && (
          <p className="text-muted-foreground text-xs">
            12–128 characters, different from your current password.
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={changePassword.isPending}
      >
        {changePassword.isPending ? (
          <>
            <Loader2Icon className="animate-spin" />
            Please wait
          </>
        ) : (
          submitLabel
        )}
      </Button>
      {errorMessage && (
        <Alert variant="destructive" role="alert">
          <AlertCircleIcon />
          <AlertTitle>{errorMessage}</AlertTitle>
        </Alert>
      )}
    </form>
  );
};
