import {
  ForceChangePassword,
  ForceChangePasswordHeader,
} from "@/components/auth/force-change-password";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { getSafeNextPath } from "@/lib/safe-next";

export default async function ForceChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthPageLayout header={<ForceChangePasswordHeader />}>
      <ForceChangePassword nextPath={getSafeNextPath(next)} />
    </AuthPageLayout>
  );
}
