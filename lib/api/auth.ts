import { apiFetch, parseApiError, readJsonBody } from "@/lib/api/client";
import type {
  ChangePasswordInput,
  LoginInput,
  LoginResponse,
  TenantMe,
} from "@/types/auth";

/**
 * POSTs to a BFF auth route (`/api/auth/*`). Unlike `apiFetch`, a 401 here is
 * not a global "session expired" signal (at login it means invalid
 * credentials), so it throws instead of redirecting.
 */
const postAuth = async <T>(path: string, body?: unknown): Promise<T> => {
  const res = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await readJsonBody(res);
  if (!res.ok) throw parseApiError(res, data);
  return data as T;
};

export const login = (input: LoginInput) =>
  postAuth<LoginResponse>("login", input);

export const logout = () => postAuth<{ ok: true }>("logout");

export const changePassword = (input: ChangePasswordInput) =>
  postAuth<{ ok: true }>("change-password", input);

export const fetchMe = () => apiFetch<TenantMe>("tenant/auth/me");
