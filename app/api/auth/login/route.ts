import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/cookies";
import { env } from "@/lib/env";
import type { LoginResponse } from "@/types/auth";
import {
  getAccessMaxAge,
  getRefreshMaxAge,
  isPlatformAuthTokens,
} from "@/lib/auth-tokens";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const res = await fetch(`${env.BACKEND_URL}/tenant/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const data: unknown = await res.json();

    if (!isPlatformAuthTokens(data)) {
      console.error(
        "[login] unexpected backend response shape:",
        data && typeof data === "object" ? Object.keys(data) : typeof data,
      );
      return NextResponse.json(
        { message: "Invalid login response" },
        { status: 500 },
      );
    }

    await setAuthCookies(
      data.accessToken,
      getAccessMaxAge(data),
      data.refreshToken,
      getRefreshMaxAge(data),
    );

    const response: LoginResponse = {
      ok: true,
      mustChangePassword: data.mustChangePassword === true,
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error(
      "[login] error:",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json({ message: "Login error" }, { status: 500 });
  }
};
