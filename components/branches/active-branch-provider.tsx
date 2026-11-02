"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMe } from "@/hooks/my-profile/useProfile";
import { fetchBranchContext } from "@/lib/api/branches";
import { queryKeys } from "@/shared/constants/query-keys";
import type { TenantMeBranch } from "@/types/auth";

type ActiveBranchContextValue = {
  /** The tab's active branch; undefined only when the user has no branches. */
  branch: TenantMeBranch | undefined;
  branchId: string | undefined;
  /** `me.branches`: ACTIVE branches the user can work in, oldest first. */
  branches: TenantMeBranch[];
  setActiveBranch: (branchId: string) => void;
  /** Branch-scoped queries must use `enabled: isReady` and key on `branchId`. */
  isReady: boolean;
};

const ActiveBranchContext = createContext<ActiveBranchContextValue | null>(
  null,
);

// Per tab (sessionStorage) and per user; localStorage seeds new tabs.
const storageKey = (userId: string) => `dshq.activeBranch.${userId}`;

const readStoredBranchId = (userId: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const key = storageKey(userId);
    return (
      window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key)
    );
  } catch {
    return null; // Storage can be unavailable (privacy modes).
  }
};

const writeStoredBranchId = (userId: string, branchId: string) => {
  try {
    const key = storageKey(userId);
    window.sessionStorage.setItem(key, branchId);
    window.localStorage.setItem(key, branchId);
  } catch {
    // Ignore: the choice just won't persist.
  }
};

/**
 * The tab's active branch. Mounted inside SessionGate, so `me` is loaded.
 * The active branch is derived from `me.branches` on every render, so an id
 * the user can no longer work in is never used.
 */
export const ActiveBranchProvider = ({ children }: { children: ReactNode }) => {
  const { data: me } = useMe();
  const userId = me?.user.id ?? "";
  const branches = useMemo(() => me?.branches ?? [], [me?.branches]);
  const defaultBranchId = me?.user.defaultBranchId ?? null;

  const [selectedId, setSelectedId] = useState<string | null>(() =>
    readStoredBranchId(userId),
  );

  const branch =
    branches.find((b) => b.id === selectedId) ??
    branches.find((b) => b.id === defaultBranchId) ??
    branches.find((b) => b.isDefault) ??
    branches[0];
  const branchId = branch?.id;

  // Read the latest list through a ref so callbacks captured earlier (e.g. a
  // "Switch to it" toast action created right after `me` refetched) still
  // validate against current branches.
  const branchesRef = useRef(branches);
  useEffect(() => {
    branchesRef.current = branches;
  }, [branches]);

  const setActiveBranch = useCallback((id: string) => {
    if (branchesRef.current.some((b) => b.id === id)) setSelectedId(id);
  }, []);

  // Persist the effective choice, and keep state in line with the fallback so
  // a lost branch doesn't silently come back if it's reopened later.
  useEffect(() => {
    if (!branchId || !userId) return;
    writeStoredBranchId(userId, branchId);
    if (selectedId !== branchId) setSelectedId(branchId);
  }, [branchId, selectedId, userId]);

  // The active branch disappeared from `me.branches` (closed, access removed,
  // or a BRANCH_ACCESS_DENIED refetched `me`): explain the switch.
  // A user-initiated switch keeps the previous branch in the list: no toast.
  const previous = useRef<TenantMeBranch | undefined>(undefined);
  useEffect(() => {
    const prev = previous.current;
    previous.current = branch;
    if (!prev || !branch || prev.id === branch.id) return;
    if (branches.some((b) => b.id === prev.id)) return;
    toast.info(
      `You no longer have access to ${prev.name}. Switched to ${branch.name}.`,
    );
  }, [branch, branches]);

  // Validates the branch once per tab with the backend (the only
  // branch-scoped endpoint so far). A 403 is handled by the QueryProvider.
  useQuery({
    queryKey: queryKeys.branchContext(branchId ?? ""),
    queryFn: () => fetchBranchContext(branchId as string),
    enabled: Boolean(branchId),
    staleTime: Infinity,
  });

  const value = useMemo<ActiveBranchContextValue>(
    () => ({
      branch,
      branchId,
      branches,
      setActiveBranch,
      isReady: Boolean(branchId),
    }),
    [branch, branchId, branches, setActiveBranch],
  );

  return (
    <ActiveBranchContext.Provider value={value}>
      {children}
    </ActiveBranchContext.Provider>
  );
};

export const useActiveBranch = (): ActiveBranchContextValue => {
  const value = useContext(ActiveBranchContext);
  if (!value) {
    throw new Error("useActiveBranch must be used inside ActiveBranchProvider");
  }
  return value;
};
