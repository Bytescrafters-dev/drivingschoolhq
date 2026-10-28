import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/cookies";

export const POST = async () => {
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
};
