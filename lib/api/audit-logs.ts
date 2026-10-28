import { apiFetch } from "@/lib/api/client";
import type { AuditLogFilters, AuditLogPage } from "@/types/audit-log";

export const fetchAuditLogs = (
  filters: AuditLogFilters,
  cursor?: string | null,
) => {
  const params = new URLSearchParams({ limit: String(filters.limit ?? 50) });
  if (filters.tenantId) params.set("tenantId", filters.tenantId);
  if (filters.targetType) params.set("targetType", filters.targetType);
  if (cursor) params.set("cursor", cursor);
  return apiFetch<AuditLogPage>(`platform/audit-logs?${params}`);
};
