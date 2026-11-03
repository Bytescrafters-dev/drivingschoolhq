import { apiFetch } from "@/lib/api/client";
import type { MyProfile, UpdateMyProfileInput } from "@/types/auth";

/** Any signed-in user: edit your own name/phone (`phone: null` clears it). */
export const updateMyProfile = (input: UpdateMyProfileInput) =>
  apiFetch<MyProfile>("tenant/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
