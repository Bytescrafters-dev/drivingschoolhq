import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type LoginInput = { email: string; password: string };

export const useLogin = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (input: LoginInput) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const msg =
          (await response.json().catch(() => ({}))).message ??
          "Failed to login!";
        throw new Error(msg);
      }

      const data: { ok: boolean; mustChangePassword: boolean } =
        await response.json();

      return { success: data.ok, mustChangePassword: data.mustChangePassword };
    } catch (err: any) {
      setError(err?.message ?? "Failed to login!");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });

      if (!response.ok) {
        const msg =
          (await response.json().catch(() => ({}))).message ??
          "Failed to logout!";
        throw new Error(msg);
      }

      queryClient.clear();
      return true;
    } catch (err: any) {
      setError(err?.message ?? "Failed to logout!");
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  return { login, logout, loading, error };
};
