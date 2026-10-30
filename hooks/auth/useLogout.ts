import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";
import { LOGIN } from "@/shared/constants/pageUrls";

/**
 * Revokes the backend session and clears the auth cookies (BFF), then drops
 * all cached data and routes to login. Always ends signed out locally.
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
      router.replace(LOGIN);
      router.refresh();
    },
  });
};
