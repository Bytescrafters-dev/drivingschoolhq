import type { District } from "@/shared/constants/districts";

export type { District };

export type BranchStatus = "ACTIVE" | "CLOSED";

export type Branch = {
  id: string;
  name: string;
  address: string;
  district: District;
  /** Always "+94XXXXXXXXX". */
  phone: string;
  status: BranchStatus;
  /** ISO timestamp. */
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** `isDefault` = the signed-in user's own default branch. */
export type BranchListItem = Branch & { isDefault: boolean };

export type BranchList = { items: BranchListItem[] };

export type LockedOutStaff = { id: string; fullName: string; email: string };

export type CloseBranchResponse = Branch & { lockedOutStaff: LockedOutStaff[] };

export type BranchContext = { branch: { id: string; name: string } };

export type BranchInput = {
  name: string;
  address: string;
  district: District;
  phone: string;
};
