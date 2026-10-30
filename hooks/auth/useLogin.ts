import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api/auth";
import type { ApiError } from "@/lib/api/client";
import type { LoginInput, LoginResponse } from "@/types/auth";

/**
 * Signs in via the BFF. Resolves to `{ ok, mustChangePassword }` or rejects
 * with an `ApiError` carrying the backend `code`.
 */
export const useLogin = () =>
  useMutation<LoginResponse, ApiError, LoginInput>({ mutationFn: login });
