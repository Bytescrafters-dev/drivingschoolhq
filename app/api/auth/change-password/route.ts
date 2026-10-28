import { NextResponse } from "next/server";
import { clearAuthCookies, getAccessTokenFromCookies } from "@/lib/cookies";
import { env } from "@/lib/env";

export const POST = async (req: Request) => {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    const res = await fetch(`${env.BACKEND_URL}/tenant/auth/change-password`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { message: data?.message ?? "Failed to change password" },
        { status: res.status },
      );
    }

    // Backend responds 204 No Content. The admin must sign in again with the
    // new credentials, so drop the current session cookies.
    await clearAuthCookies();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Change password error" },
      { status: 500 },
    );
  }
};
