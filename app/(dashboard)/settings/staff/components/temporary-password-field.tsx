"use client";

import { useFormContext } from "react-hook-form";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copyText } from "@/lib/clipboard";
import { generateTemporaryPassword } from "@/lib/temp-password";
import { FieldError, errorProps } from "./field-error";

export const copyWithToast = async (text: string, what = "Copied") => {
  if (await copyText(text)) toast.success(what);
  else toast.error("Couldn't copy. Select the text and copy it manually.");
};

/**
 * Temporary password with Generate and Copy. Shown in plain text: the manager
 * hands it to the person (there is no email delivery).
 */
export const TemporaryPasswordField = () => {
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<{ temporaryPassword: string }>();
  const error = errors.temporaryPassword?.message;

  return (
    <div className="grid gap-2">
      <Label htmlFor="staff-temporaryPassword">Temporary password</Label>
      <div className="flex gap-2">
        <Input
          id="staff-temporaryPassword"
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
          {...errorProps("staff-temporaryPassword-error", error)}
          {...register("temporaryPassword")}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Generate a new password"
          onClick={() =>
            setValue("temporaryPassword", generateTemporaryPassword(), {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
        >
          <RefreshCwIcon />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Copy password"
          onClick={() =>
            copyWithToast(getValues("temporaryPassword"), "Password copied")
          }
        >
          <CopyIcon />
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">
        12–128 characters. They must change it when they first sign in.
      </p>
      <FieldError id="staff-temporaryPassword-error" message={error} />
    </div>
  );
};
