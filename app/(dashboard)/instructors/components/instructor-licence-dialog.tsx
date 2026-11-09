"use client";

import { DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LicenceDialogFrame,
  LicenceForm,
  type LicenceDialogCopy,
  type LicenceDialogMode,
  type LicenceSaved,
} from "@/components/licences/licence-dialog";
import { useVehicleClasses } from "@/hooks/branches/useVehicleClasses";
import {
  useCorrectInstructorLicence,
  useCreateInstructorProfile,
  useRecordInstructorLicence,
} from "@/hooks/instructors/useInstructorMutations";
import type { InstructorDetail, InstructorUser } from "@/types/instructor";
import type { Licence, LicenceChange } from "@/types/licence";

/** Create returns the detail; renew/correct add `removedVehicleClasses`. */
export type InstructorLicenceResult = InstructorDetail & Partial<LicenceChange>;

const copyFor = (name: string, isSelf: boolean): LicenceDialogCopy => {
  const whose = isSelf ? "your" : `${name}'s`;
  return {
    first: {
      title: isSelf ? "Set up your instructor profile" : `Set up ${name}'s instructor profile`,
      description: `Record ${whose} instructor licence. Its grade decides which vehicle classes ${isSelf ? "you" : "they"} can be qualified to teach.`,
      submit: "Set up profile",
    },
    renew: {
      title: "Renew instructor licence",
      description: `Record ${whose} new instructor licence. The current licence stays in the licence history.`,
      submit: "Save renewal",
    },
    correct: {
      title: "Edit licence details",
      description:
        "Fix a mistake in the current licence. This doesn't add a new licence to the history.",
      submit: "Save changes",
    },
  };
};

// Errors that mean the dialog no longer applies; the hooks refetch.
const CLOSING_CODES: Record<string, string | null> = {
  PLAN_LIMIT_REACHED: null, // Shown in the plan-limit dialog.
  STAFF_DISABLED: "Enable this staff member first.",
  INSTRUCTOR_PROFILE_EXISTS:
    "This person already has an instructor profile. It has been reloaded.",
  INSTRUCTOR_PROFILE_MISSING:
    "This person has no instructor profile yet. Set it up first.",
  INSTRUCTOR_MANAGEMENT_DENIED:
    "You can't change this person's instructor profile.",
  INSTRUCTOR_NOT_FOUND: "Instructor not found.",
};

type Props = {
  user: Pick<InstructorUser, "id" | "fullName">;
  isSelf: boolean;
  current: Licence | null;
  /** Qualified codes, to warn before a lower grade removes some. */
  selectedCodes: string[];
  onSaved: (saved: LicenceSaved<InstructorLicenceResult>) => void;
  onPlanLimit: (message: string) => void;
};

const InstructorLicenceForm = ({
  mode,
  user,
  isSelf,
  current,
  selectedCodes,
  onDone,
  onSaved,
  onPlanLimit,
}: Props & { mode: LicenceDialogMode; onDone: () => void }) => {
  const classes = useVehicleClasses();
  const create = useCreateInstructorProfile(user.id);
  const record = useRecordInstructorLicence(user.id);
  const correct = useCorrectInstructorLicence(user.id);

  if (!classes.data) {
    return (
      <div className="grid gap-4" aria-busy="true">
        <DialogTitle className="sr-only">Loading</DialogTitle>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  return (
    <LicenceForm<InstructorLicenceResult>
      mode={mode}
      current={current}
      selectedCodes={selectedCodes}
      classes={classes.data}
      copy={copyFor(user.fullName, isSelf)}
      removalNote={`They will be removed from the classes ${isSelf ? "you are" : "this instructor is"} qualified to teach.`}
      mutations={{ first: create, renew: record, correct }}
      closingCodes={CLOSING_CODES}
      onClosingError={(code, error) => {
        if (code === "PLAN_LIMIT_REACHED") {
          onPlanLimit(error instanceof Error ? error.message : "");
        }
      }}
      onDone={onDone}
      onSaved={onSaved}
    />
  );
};

/** Set up a profile (first licence), renew the licence, or correct it. */
export const InstructorLicenceDialog = ({
  mode,
  onOpenChange,
  ...props
}: Props & {
  /** Null while closed. */
  mode: LicenceDialogMode | null;
  onOpenChange: (open: boolean) => void;
}) => (
  <LicenceDialogFrame open={mode !== null} onOpenChange={onOpenChange}>
    {mode && (
      <InstructorLicenceForm
        key={`${props.user.id}-${mode}`}
        mode={mode}
        onDone={() => onOpenChange(false)}
        {...props}
      />
    )}
  </LicenceDialogFrame>
);
