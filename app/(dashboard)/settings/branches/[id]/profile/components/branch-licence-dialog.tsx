"use client";

import {
  LicenceDialogFrame,
  LicenceForm,
  type LicenceDialogCopy,
  type LicenceDialogMode,
  type LicenceSaved,
} from "@/components/licences/licence-dialog";
import {
  useCorrectLicence,
  useRecordLicence,
} from "@/hooks/branches/useBranchProfileMutations";
import type { BranchProfile, LicenceChangeResponse } from "@/types/branch";
import type { VehicleClass } from "@/types/vehicle-class";

const COPY: LicenceDialogCopy = {
  first: {
    title: "Add licence",
    description:
      "Record the branch's driving-school licence. Its grade decides which vehicle classes the branch may offer.",
    submit: "Add licence",
  },
  renew: {
    title: "Renew licence",
    description:
      "Record the new licence issued by the DMT. The current licence stays in the licence history.",
    submit: "Save renewal",
  },
  correct: {
    title: "Edit licence details",
    description:
      "Fix a mistake in the current licence. This doesn't add a new licence to the history.",
    submit: "Save changes",
  },
};

// Errors that mean the dialog no longer applies; the hooks refetch.
const CLOSING_CODES: Record<string, string | null> = {
  BRANCH_CLOSED: "Reopen the branch to edit its profile.",
  BRANCH_LICENCE_MISSING: "This branch has no licence yet. Add it first.",
  BRANCH_NOT_FOUND: null, // The page shows "not found" after the refetch.
};

type Props = {
  branchId: string;
  profile: BranchProfile;
  classes: VehicleClass[];
  onSaved: (saved: LicenceSaved<LicenceChangeResponse>) => void;
};

const BranchLicenceForm = ({
  mode,
  branchId,
  profile,
  classes,
  onDone,
  onSaved,
}: Props & { mode: LicenceDialogMode; onDone: () => void }) => {
  const record = useRecordLicence(branchId);
  const correct = useCorrectLicence(branchId);

  return (
    <LicenceForm
      mode={mode}
      current={profile.currentLicence}
      selectedCodes={profile.offeredVehicleClasses.map((c) => c.code)}
      classes={classes}
      copy={COPY}
      removalNote="They will be removed from this branch's classes. Existing customers and applications are not affected."
      numberPlaceholder="e.g. DS/WP/0042"
      mutations={{ first: record, renew: record, correct }}
      closingCodes={CLOSING_CODES}
      onDone={onDone}
      onSaved={onSaved}
    />
  );
};

/** Add the first branch licence, renew it, or correct the current one. */
export const BranchLicenceDialog = ({
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
      <BranchLicenceForm
        key={mode}
        mode={mode}
        onDone={() => onOpenChange(false)}
        {...props}
      />
    )}
  </LicenceDialogFrame>
);
