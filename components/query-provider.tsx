"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/shared/constants/query-keys";

/**
 * App-wide reactions to backend errors that aren't specific to one screen.
 * - BRANCH_ACCESS_DENIED: the tab's branch is no longer workable. Refetch
 *   `me`; the ActiveBranchProvider then switches branch and explains why.
 * - TENANT_PERMISSION_DENIED: the user's role may have changed. Toast and
 *   refetch `me` so permission-gated UI updates.
 * - BRANCH_REQUIRED: a branch-scoped call was sent without X-Branch-Id
 *   (frontend bug).
 */
const handleGlobalError = (client: QueryClient, error: unknown) => {
  if (!(error instanceof ApiError)) return;

  switch (error.code) {
    case "BRANCH_ACCESS_DENIED":
      void client.invalidateQueries({ queryKey: queryKeys.me });
      break;
    case "TENANT_PERMISSION_DENIED":
      toast.error("You don't have permission to do this.");
      void client.invalidateQueries({ queryKey: queryKeys.me });
      break;
    case "BRANCH_REQUIRED":
      console.error(
        "[api] branch-scoped request sent without X-Branch-Id:",
        error.message,
      );
      break;
  }
};

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(() => {
    const queryClient: QueryClient = new QueryClient({
      queryCache: new QueryCache({
        onError: (error) => handleGlobalError(queryClient, error),
      }),
      mutationCache: new MutationCache({
        onError: (error) => handleGlobalError(queryClient, error),
      }),
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          // Retry once for network/server errors; 4xx (incl. 401) won't succeed on retry.
          retry: (failureCount, error) =>
            !(error instanceof ApiError && error.status < 500) &&
            failureCount < 1,
        },
      },
    });
    return queryClient;
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
