import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "@/lib/api/audit-logs";
import type { AuditLogFilters } from "@/types/audit-log";

export const auditLogKeys = {
  all: ["audit-logs"] as const,
  list: (filters: AuditLogFilters) => [...auditLogKeys.all, filters] as const,
};

/** Cursor-paginated audit entries, newest first ("Load more" = fetchNextPage). */
export const useAuditLogs = (filters: AuditLogFilters, enabled = true) =>
  useInfiniteQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: ({ pageParam }) => fetchAuditLogs(filters, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });
