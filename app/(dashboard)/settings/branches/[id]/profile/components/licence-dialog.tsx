"use client";

import { useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FieldError, errorProps } from "@/components/common/field-error";
import {
  FormErrorAlert,
  SubmitButton,
} from "@/components/common/form-feedback";
import {
  useCorrectLicence,
  useRecordLicence,
} from "@/hooks/branches/useBranchProfileMutations";
import {
  getApiErrorCode,
  isGloballyHandledError,
} from "@/lib/api/error-messages";
import { isValidCalendarDate } from "@/lib/dates";
import { classesDroppedByGrade, permittedCodes } from "@/lib/vehicle-classes";
import { DRIVING_SCHOOL_GRADES, gradeLabel } from "@/shared/constants/grades";
import type {
  BranchLicence,
  BranchProfile,
  LicenceChangeResponse,
  LicenceInput,
} from "@/types/branch";
import type { VehicleClass } from "@/types/vehicle-class";

export type LicenceDialogMode = "first" | "renew" | "correct";

export type LicenceSaved = {
  mode: LicenceDialogMode;
  response: LicenceChangeResponse;
  /** The profile before the change, to compare permitted classes. */
  previous: BranchProfile;
};

const calendarDate = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine(isValidCalendarDate, "Enter a valid date");

const schema = z
  .object({
    licenceNumber: z
      .string()
      .trim()
      .min(1, "Licence number is required")
      .max(100, "Licence number must be at most 100 characters"),
    grade: z.enum(DRIVING_SCHOOL_GRADES, { message: "Choose a grade" }),
    issuedOn: calendarDate("Issue date"),
    expiresOn: calendarDate("Expiry date"),
  })
  .superRefine((values, ctx) => {
    // "YYYY-MM-DD" strings compare in date order.
    if (
      isValidCalendarDate(values.issuedOn) &&
      isValidCalendarDate(values.expiresOn) &&
      values.expiresOn <= values.issuedOn
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresOn"],
        message: "Expiry must be after the issue date",
      });
    }
  });
type Form = z.infer<typeof schema>;

const COPY: Record<
  LicenceDialogMode,
  { title: string; description: string; submit: string }
> = {
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

const defaultValues = (
  mode: LicenceDialogMode,
  licence: BranchLicence | null,
): Partial<Form> => {
  if (!licence || mode === "first") {
    return { licenceNumber: "", issuedOn: "", expiresOn: "" };
  }
  if (mode === "renew") {
    return {
      licenceNumber: licence.licenceNumber,
      grade: licence.grade,
      issuedOn: "",
      expiresOn: "",
    };
  }
  return {
    licenceNumber: licence.licenceNumber,
    grade: licence.grade,
    issuedOn: licence.issuedOn,
    expiresOn: licence.expiresOn,
  };
};

/** Only the fields that differ from the current licence. */
const changedFields = (values: LicenceInput, licence: BranchLicence) => {
  const patch: Partial<LicenceInput> = {};
  if (values.licenceNumber !== licence.licenceNumber) {
    patch.licenceNumber = values.licenceNumber;
  }
  if (values.grade !== licence.grade) patch.grade = values.grade;
  if (values.issuedOn !== licence.issuedOn) patch.issuedOn = values.issuedOn;
  if (values.expiresOn !== licence.expiresOn) {
    patch.expiresOn = values.expiresOn;
  }
  return patch;
};

// Errors that mean the dialog no longer applies; the hooks refetch.
const CLOSING_CODES: Record<string, string | null> = {
  BRANCH_CLOSED: "Reopen the branch to edit its profile.",
  BRANCH_LICENCE_MISSING: "This branch has no licence yet. Add it first.",
  BRANCH_NOT_FOUND: null, // The page shows "not found" after the refetch.
};

type FormProps = {
  mode: LicenceDialogMode;
  branchId: string;
  profile: BranchProfile;
  classes: VehicleClass[];
  onDone: () => void;
  onSaved: (saved: LicenceSaved) => void;
};

const LicenceForm = ({
  mode,
  branchId,
  profile,
  classes,
  onDone,
  onSaved,
}: FormProps) => {
  const licence = mode === "first" ? null : profile.currentLicence;
  const record = useRecordLicence(branchId);
  const correct = useCorrectLicence(branchId);
  const mutation = mode === "correct" ? correct : record;
  const copy = COPY[mode];

  // Set when a lower grade would remove offered classes.
  const [confirm, setConfirm] = useState<{
    values: Form;
    dropped: string[];
  } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues(mode, licence),
  });

  const onError = (error: unknown) => {
    const code = getApiErrorCode(error);
    if (code === "INVALID_LICENCE_DATES") {
      setConfirm(null);
      setError("expiresOn", { message: "Expiry must be after the issue date" });
      return;
    }
    if (code && code in CLOSING_CODES) {
      const message = CLOSING_CODES[code];
      if (message) toast.error(message);
      onDone();
      return;
    }
    if (isGloballyHandledError(error)) {
      onDone();
      return;
    }
    // Anything else: the inline alert (via `mutation.error`).
    setConfirm(null);
  };

  const save = async (values: Form) => {
    try {
      let response: LicenceChangeResponse;
      if (mode === "correct" && licence) {
        const patch = changedFields(values, licence);
        if (Object.keys(patch).length === 0) {
          onDone();
          return;
        }
        response = await correct.mutateAsync(patch);
      } else {
        response = await record.mutateAsync(values);
      }
      onDone();
      onSaved({ mode, response, previous: profile });
    } catch (error) {
      onError(error);
    }
  };

  const onSubmit = (values: Form) => {
    const current = profile.currentLicence;
    if (mode !== "first" && current && values.grade !== current.grade) {
      const dropped = classesDroppedByGrade(
        profile.offeredVehicleClasses.map((c) => c.code),
        values.grade,
        classes,
      );
      if (dropped.length > 0) {
        setConfirm({ values, dropped });
        return;
      }
    }
    void save(values);
  };

  if (confirm) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Remove vehicle classes?</DialogTitle>
          <DialogDescription>
            {gradeLabel(confirm.values.grade)} doesn&apos;t permit{" "}
            <strong className="text-foreground font-medium">
              {confirm.dropped.join(", ")}
            </strong>
            . They will be removed from this branch&apos;s classes. Existing
            customers and applications are not affected.
          </DialogDescription>
        </DialogHeader>
        <FormErrorAlert error={mutation.error} />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirm(null)}
            disabled={mutation.isPending}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={() => void save(confirm.values)}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2Icon className="animate-spin" />}
            Remove and save
          </Button>
        </DialogFooter>
      </>
    );
  }

  const fieldErrorCodes = [
    "INVALID_LICENCE_DATES",
    ...Object.keys(CLOSING_CODES),
  ];
  const alertError = fieldErrorCodes.includes(
    getApiErrorCode(mutation.error) ?? "",
  )
    ? null
    : mutation.error;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{copy.title}</DialogTitle>
        <DialogDescription>{copy.description}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        <div className="grid gap-2">
          <Label htmlFor="licence-number">Licence number</Label>
          <Input
            id="licence-number"
            autoComplete="off"
            placeholder="e.g. DS/WP/0042"
            {...errorProps(
              "licence-number-error",
              errors.licenceNumber?.message,
            )}
            {...register("licenceNumber")}
          />
          <FieldError
            id="licence-number-error"
            message={errors.licenceNumber?.message}
          />
        </div>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm leading-none font-medium">
            Grade
          </legend>
          <Controller
            control={control}
            name="grade"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={field.onChange}
                className="grid gap-2 sm:grid-cols-3"
                {...errorProps("licence-grade-error", errors.grade?.message)}
              >
                {DRIVING_SCHOOL_GRADES.map((grade) => (
                  <Label
                    key={grade}
                    htmlFor={`licence-grade-${grade}`}
                    className="has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal"
                  >
                    <RadioGroupItem
                      id={`licence-grade-${grade}`}
                      value={grade}
                      className="mt-0.5"
                    />
                    <span className="grid gap-0.5">
                      <span className="font-medium">{gradeLabel(grade)}</span>
                      <span className="text-muted-foreground text-xs">
                        {permittedCodes(grade, classes).length} classes
                      </span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            )}
          />
          <FieldError
            id="licence-grade-error"
            message={errors.grade?.message}
          />
        </fieldset>

        <div className="grid items-start gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="licence-issued">Issued on</Label>
            <Input
              id="licence-issued"
              type="date"
              {...errorProps("licence-issued-error", errors.issuedOn?.message)}
              {...register("issuedOn")}
            />
            <FieldError
              id="licence-issued-error"
              message={errors.issuedOn?.message}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="licence-expires">Expires on</Label>
            <Input
              id="licence-expires"
              type="date"
              {...errorProps(
                "licence-expires-error",
                errors.expiresOn?.message,
              )}
              {...register("expiresOn")}
            />
            <FieldError
              id="licence-expires-error"
              message={errors.expiresOn?.message}
            />
            <p className="text-muted-foreground text-xs">
              The last day the licence is valid.
            </p>
          </div>
        </div>

        <FormErrorAlert error={alertError} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <SubmitButton pending={mutation.isPending}>
            {copy.submit}
          </SubmitButton>
        </DialogFooter>
      </form>
    </>
  );
};

type Props = Omit<FormProps, "mode" | "onDone"> & {
  /** Null while closed. */
  mode: LicenceDialogMode | null;
  onOpenChange: (open: boolean) => void;
};

/** Add the first licence, renew it, or correct the current one. */
export const LicenceDialog = ({ mode, onOpenChange, ...formProps }: Props) => (
  <Dialog open={mode !== null} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      {/* Keyed so each open starts from fresh values and mutation state. */}
      {mode && (
        <LicenceForm
          key={mode}
          mode={mode}
          onDone={() => onOpenChange(false)}
          {...formProps}
        />
      )}
    </DialogContent>
  </Dialog>
);
