"use client";

import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TENANT_ROLES, roleLabel } from "@/shared/constants/roles";
import type { TenantMeBranch } from "@/types/auth";

const ALL = "all";

export type StaffFilterValues = {
  search: string;
  role: string | null;
  /** "ACTIVE" (default), "DISABLED" or "ALL". */
  status: string;
  branchId: string | null;
};

type Props = {
  values: StaffFilterValues;
  branches: TenantMeBranch[];
  onChange: (
    key: "q" | "role" | "status" | "branch",
    value: string | null,
  ) => void;
};

export const StaffFilters = ({ values, branches, onChange }: Props) => {
  // Local text so typing stays responsive; the URL updates after a pause.
  const [search, setSearch] = useState(values.search);
  const pushSearch = useDebouncedCallback(
    (value: string) => onChange("q", value.trim() || null),
    300,
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_repeat(3,11rem)]">
      <div className="relative">
        <Label htmlFor="staff-search" className="sr-only">
          Search by name or email
        </Label>
        <SearchIcon
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          id="staff-search"
          type="search"
          placeholder="Search name or email"
          maxLength={100}
          className="pr-9 pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            pushSearch(e.target.value);
          }}
        />
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
            aria-label="Clear search"
            onClick={() => {
              setSearch("");
              pushSearch.cancel();
              onChange("q", null);
            }}
          >
            <XIcon />
          </Button>
        )}
      </div>

      <Select
        value={values.role ?? ALL}
        onValueChange={(v) => onChange("role", v === ALL ? null : v)}
      >
        <SelectTrigger className="w-full" aria-label="Filter by role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All roles</SelectItem>
          {TENANT_ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {roleLabel(role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={values.status}
        // ACTIVE is the default, so it isn't written to the URL.
        onValueChange={(v) => onChange("status", v === "ACTIVE" ? null : v)}
      >
        <SelectTrigger className="w-full" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="DISABLED">Disabled</SelectItem>
          <SelectItem value="ALL">All statuses</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={values.branchId ?? ALL}
        onValueChange={(v) => onChange("branch", v === ALL ? null : v)}
      >
        <SelectTrigger className="w-full" aria-label="Filter by branch">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All branches</SelectItem>
          {branches.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
