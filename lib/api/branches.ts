import { apiFetch } from "@/lib/api/client";
import type {
  Branch,
  BranchContext,
  BranchDetail,
  BranchInput,
  BranchList,
  CloseBranchResponse,
} from "@/types/branch";

// School-wide endpoints: no X-Branch-Id (except `fetchBranchContext`).

const json = (body: unknown) => JSON.stringify(body);

export const fetchBranches = (includeClosed: boolean) =>
  apiFetch<BranchList>(`tenant/branches?includeClosed=${includeClosed}`);

export const fetchBranch = (id: string) =>
  apiFetch<BranchDetail>(`tenant/branches/${encodeURIComponent(id)}`);

export const createBranch = (input: BranchInput) =>
  apiFetch<Branch>("tenant/branches", { method: "POST", body: json(input) });

export const updateBranch = (id: string, patch: Partial<BranchInput>) =>
  apiFetch<Branch>(`tenant/branches/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: json(patch),
  });

export const closeBranch = (id: string) =>
  apiFetch<CloseBranchResponse>(
    `tenant/branches/${encodeURIComponent(id)}/close`,
    { method: "POST" },
  );

export const reopenBranch = (id: string) =>
  apiFetch<Branch>(`tenant/branches/${encodeURIComponent(id)}/reopen`, {
    method: "POST",
  });

/** Changes only the signed-in user's own default branch. */
export const setDefaultBranch = (branchId: string) =>
  apiFetch<Branch>("tenant/me/default-branch", {
    method: "PATCH",
    body: json({ branchId }),
  });

/** Branch-scoped: confirms the user may work in `branchId`. */
export const fetchBranchContext = (branchId: string) =>
  apiFetch<BranchContext>("tenant/branch-context", { branchId });
