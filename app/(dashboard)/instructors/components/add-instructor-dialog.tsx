"use client";

import { useState } from "react";
import { UserPlusIcon } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructorCandidates } from "@/hooks/instructors/useInstructors";
import { roleLabel } from "@/shared/constants/roles";
import type { InstructorUser } from "@/types/instructor";

const CandidatePicker = ({
  branchName,
  onPick,
  onCancel,
}: {
  branchName: string;
  onPick: (user: InstructorUser) => void;
  onCancel: () => void;
}) => {
  const candidates = useInstructorCandidates(true);
  const [selectedId, setSelectedId] = useState("");
  const selected = candidates.data?.find((c) => c.user.id === selectedId);

  let body;
  if (candidates.isPending) {
    body = (
      <div className="grid gap-2" aria-busy="true">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
        <span className="sr-only">Loading staff</span>
      </div>
    );
  } else if (candidates.isError) {
    body = (
      <div className="flex flex-col items-start gap-2 text-sm">
        <p className="text-muted-foreground">Couldn&apos;t load staff.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => candidates.refetch()}
          disabled={candidates.isFetching}
        >
          Retry
        </Button>
      </div>
    );
  } else if (candidates.data.length === 0) {
    body = (
      <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
        Everyone at {branchName} you can manage already has an instructor
        profile. Add staff first in Settings → Staff.
      </p>
    );
  } else {
    body = (
      <RadioGroup
        value={selectedId}
        onValueChange={setSelectedId}
        aria-label="Staff member"
        className="max-h-80 gap-2 overflow-y-auto"
      >
        {candidates.data.map(({ user }) => (
          <Label
            key={user.id}
            htmlFor={`candidate-${user.id}`}
            className="has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal"
          >
            <RadioGroupItem
              id={`candidate-${user.id}`}
              value={user.id}
              className="mt-0.5"
            />
            <span className="grid min-w-0 gap-0.5">
              <span className="font-medium">{user.fullName}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email} · {roleLabel(user.role)}
              </span>
            </span>
          </Label>
        ))}
      </RadioGroup>
    );
  }

  return (
    <>
      {body}
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={!selected}
          onClick={() => selected && onPick(selected.user)}
        >
          Continue
        </Button>
      </DialogFooter>
    </>
  );
};

/** Step 1 of "Add instructor profile": choose who. Step 2 is the licence dialog. */
export const AddInstructorDialog = ({
  open,
  onOpenChange,
  branchName,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchName: string;
  onPick: (user: InstructorUser) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlusIcon className="size-5" aria-hidden />
          Add instructor profile
        </DialogTitle>
        <DialogDescription>
          Anyone on your staff can teach. Choose who to set up; their
          profile applies in every branch they work in.
        </DialogDescription>
      </DialogHeader>
      {open && (
        <CandidatePicker
          branchName={branchName}
          onCancel={() => onOpenChange(false)}
          onPick={(user) => {
            onOpenChange(false);
            onPick(user);
          }}
        />
      )}
    </DialogContent>
  </Dialog>
);
