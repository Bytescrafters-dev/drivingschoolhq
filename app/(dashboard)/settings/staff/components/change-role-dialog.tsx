"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChangeStaffRole } from "@/hooks/staff/useStaffMutations";
import { roleLabel } from "@/shared/constants/roles";
import type { TenantRole } from "@/types/auth";
import type { Staff, StaffOptions } from "@/types/staff";
import {
  FormErrorAlert,
  SubmitButton,
  WithStaffOptions,
} from "./dialog-helpers";

const ChangeRoleForm = ({
  staff,
  options,
  onDone,
}: {
  staff: Staff;
  options: StaffOptions;
  onDone: () => void;
}) => {
  const [role, setRole] = useState<TenantRole>(staff.role);
  const change = useChangeStaffRole();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    change.mutate(
      { id: staff.id, role },
      {
        onSuccess: () => {
          toast.success(`${staff.fullName} is now ${roleLabel(role)}`);
          onDone();
        },
      },
    );
  };

  // `options.roles` never includes your own rank or above.
  const choices = options.roles.includes(staff.role)
    ? options.roles
    : [staff.role, ...options.roles];

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="staff-change-role">Role</Label>
        <Select value={role} onValueChange={(v) => setRole(v as TenantRole)}>
          <SelectTrigger id="staff-change-role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {choices.map((r) => (
              <SelectItem
                key={r}
                value={r}
                disabled={!options.roles.includes(r)}
              >
                {roleLabel(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs">
          Applies on their next action. They stay signed in.
        </p>
      </div>
      <FormErrorAlert error={change.error} />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <SubmitButton pending={change.isPending} disabled={role === staff.role}>
          Change role
        </SubmitButton>
      </DialogFooter>
    </form>
  );
};

export const ChangeRoleDialog = ({
  staff,
  onOpenChange,
}: {
  staff: Staff | null;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={Boolean(staff)} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Change role</DialogTitle>
        <DialogDescription>{staff?.fullName}</DialogDescription>
      </DialogHeader>
      {staff && (
        <WithStaffOptions>
          {(options) => (
            <ChangeRoleForm
              key={staff.id}
              staff={staff}
              options={options}
              onDone={() => onOpenChange(false)}
            />
          )}
        </WithStaffOptions>
      )}
    </DialogContent>
  </Dialog>
);
