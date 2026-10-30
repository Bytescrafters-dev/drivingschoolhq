"use client";

import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export const ProfileChangePassword = () => (
  <Card>
    <CardHeader>
      <CardTitle>Change password</CardTitle>
      <CardDescription>
        You stay signed in here. Other devices will be signed out.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ChangePasswordForm
        onSuccess={() =>
          toast.success("Password changed. Other devices were signed out.")
        }
      />
    </CardContent>
  </Card>
);
