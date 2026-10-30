"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { AlertCircleIcon, InfoIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PasswordInput from "@/components/common/PasswordInput";
import { useLogin } from "@/hooks/auth/useLogin";
import { getApiErrorMessage } from "@/lib/api/error-messages";
import { FORCE_CHANGE_PASSWORD } from "@/shared/constants/pageUrls";

// The DS code is not a secret; remembering it saves typing on shared desks.
const LAST_DS_CODE_KEY = "dshq:lastDsCode";

const schema = z.object({
  dsCode: z
    .string()
    .trim()
    .min(1, "DS code is required")
    .max(30, "DS code is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .pipe(z.email("Enter a valid email")),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});
type Form = z.infer<typeof schema>;

export const LoginForm = ({
  nextPath = "/",
  sessionExpired = false,
}: {
  nextPath?: string;
  sessionExpired?: boolean;
}) => {
  const router = useRouter();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { dsCode: "", email: "", password: "" },
  });

  // Restore after mount (not during render) to avoid a hydration mismatch.
  useEffect(() => {
    const last = window.localStorage.getItem(LAST_DS_CODE_KEY);
    if (last) setValue("dsCode", last);
  }, [setValue]);

  const dsCodeField = register("dsCode");

  const onSubmit = async (values: Form) => {
    const dsCode = values.dsCode.toUpperCase();
    let result;
    try {
      result = await login.mutateAsync({ ...values, dsCode });
    } catch {
      return; // Surfaced via `login.error`.
    }

    window.localStorage.setItem(LAST_DS_CODE_KEY, dsCode);

    if (result.mustChangePassword) {
      const params = new URLSearchParams({ next: nextPath });
      router.replace(`${FORCE_CHANGE_PASSWORD}?${params}`);
    } else {
      router.replace(nextPath);
    }
    router.refresh();
  };

  const errorMessage = getApiErrorMessage(login.error);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your school</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your school&apos;s DS code, your email and password
        </p>
      </div>

      {sessionExpired && !errorMessage && (
        <Alert>
          <InfoIcon />
          <AlertTitle>
            Your session has expired. Please sign in again.
          </AlertTitle>
        </Alert>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="dsCode">DS code</Label>
          <Input
            id="dsCode"
            placeholder="DS101"
            autoComplete="organization"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={errors.dsCode ? true : undefined}
            aria-describedby={errors.dsCode ? "dsCode-error" : undefined}
            {...dsCodeField}
            onChange={(e) => {
              const { selectionStart, selectionEnd } = e.target;
              e.target.value = e.target.value.toUpperCase();
              e.target.setSelectionRange(selectionStart, selectionEnd);
              dsCodeField.onChange(e);
            }}
          />
          {errors.dsCode && (
            <p id="dsCode-error" className="text-xs text-destructive">
              {errors.dsCode.message}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="me@example.com"
            autoComplete="username"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot password?
                </button>
              </PopoverTrigger>
              <PopoverContent className="text-sm" align="end">
                Ask your school owner or admin to reset it. Owners: contact
                DrivingSchoolHQ support.
              </PopoverContent>
            </Popover>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? (
            <>
              <Loader2Icon className="animate-spin" />
              Please wait
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        {errorMessage && (
          <Alert variant="destructive" role="alert">
            <AlertCircleIcon />
            <AlertTitle>{errorMessage}</AlertTitle>
          </Alert>
        )}
      </div>
    </form>
  );
};
