"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { useProfile } from "@/hooks/my-profile/useProfile";
import { toast } from "sonner";
import { LOGIN } from "@/shared/constants/pageUrls";
import PasswordInput from "../common/PasswordInput";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type Form = z.infer<typeof schema>;

export const ForcePasswordChangeForm = ({
  nextPath = "/",
}: {
  nextPath?: string;
}) => {
  const router = useRouter();

  const { register, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
  });
  const { changePassword, changingPassword, changePasswordError } =
    useProfile();

  const onSubmit = async ({ currentPassword, newPassword }: Form) => {
    try {
      await changePassword({ currentPassword, newPassword });
    } catch {
      // Error message is surfaced via `changePasswordError`.
      return;
    }

    toast.success(
      "Password changed successfully, now login using new credentials",
    );
    router.replace(`${LOGIN}?next=${encodeURIComponent(nextPath)}`);
    router.refresh();
  };

  // Handle error message
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Please change your password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your current password and your new password
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="currentPassword">Current password</Label>
          <PasswordInput
            id="currentPassword"
            placeholder="********"
            {...register("currentPassword")}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="newPassword">New password</Label>
          <PasswordInput
            id="newPassword"
            placeholder="********"
            {...register("newPassword")}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="********"
            {...register("confirmPassword")}
          />
        </div>
        <Button type="submit" className="w-full" disabled={changingPassword}>
          {changingPassword ? (
            <>
              <Loader2Icon className="animate-spin" />
              Please wait
            </>
          ) : (
            "Change Password"
          )}
        </Button>
        {changePasswordError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{changePasswordError}</AlertTitle>
          </Alert>
        )}
      </div>
    </form>
  );
};
