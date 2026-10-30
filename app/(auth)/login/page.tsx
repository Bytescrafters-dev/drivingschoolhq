import { LoginForm } from "@/components/auth/login-form";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { getSafeNextPath } from "@/lib/safe-next";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[];
    reason?: string | string[];
  }>;
}) {
  const { next, reason } = await searchParams;

  return (
    <AuthPageLayout>
      <LoginForm
        nextPath={getSafeNextPath(next)}
        sessionExpired={reason === "expired"}
      />
    </AuthPageLayout>
  );
}
