"use client";

import type { ReactNode } from "react";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  getApiErrorMessage,
  isGloballyHandledError,
} from "@/lib/api/error-messages";

/** Inline alert for errors that aren't field errors or handled app-wide. */
export const FormErrorAlert = ({ error }: { error: unknown }) => {
  if (!error || isGloballyHandledError(error)) return null;
  return (
    <Alert variant="destructive" role="alert">
      <AlertCircleIcon />
      <AlertTitle>{getApiErrorMessage(error)}</AlertTitle>
    </Alert>
  );
};

export const SubmitButton = ({
  pending,
  disabled = false,
  children,
  variant,
}: {
  pending: boolean;
  disabled?: boolean;
  children: ReactNode;
  variant?: "default" | "destructive";
}) => (
  <Button type="submit" disabled={pending || disabled} variant={variant}>
    {pending && <Loader2Icon className="animate-spin" />}
    {children}
  </Button>
);
