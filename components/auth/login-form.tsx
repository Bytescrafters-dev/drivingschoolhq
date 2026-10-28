"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/auth/useLogin";
import { Loader2Icon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import PasswordInput from "../common/PasswordInput";

const schema = z.object({
  email: z.email(),
  password: z.string(),
});
type Form = z.infer<typeof schema>;

export const LoginForm = ({ nextPath = "/" }: { nextPath?: string }) => {
  const router = useRouter();

  const { register, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
  });
  const { login, error, loading } = useLogin();

  const onSubmit = async (values: Form) => {
    const response = await login(values);
    if (response?.success) {
      if (response?.mustChangePassword) {
        router.push(`/forceChangePassword?next=${nextPath}`);
        router.refresh();
        return;
      }
      router.push(nextPath);
      router.refresh();
    }
  };

  // Handle error message
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="me@example.com"
            {...register("email")}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <PasswordInput id="password" {...register("password")} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2Icon className="animate-spin" />
              Please wait
            </>
          ) : (
            "Login"
          )}
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
      </div>
      {/* <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="#" className="underline underline-offset-4">
          Sign up
        </a>
      </div> */}
    </form>
  );
};
