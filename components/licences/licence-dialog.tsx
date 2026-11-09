"use client";

import { useState, type ReactNode } from "react";
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
  getApiErrorCode,
  isGloballyHandledError,
} from "@/lib/api/error-messages";
import { isValidCalendarDate } from "@/lib/dates";
import { classesDroppedByGrade, permittedCodes } from "@/lib/vehicle-classes";
import { DRIVING_SCHOOL_GRADES, gradeLabel } from "@/shared/constants/grades";
import type { Licence, LicenceInput } from "@/types/licence";
import type { DrivingSchoolGrade, VehicleClass } from "@/types/vehicle-class";

/**
 * - first: no licence yet (branch licence, or instructor profile setup);
 * - renew: a new licence, the old one stays in the history;
 * - correct: fix the current licence in place.
 */
export type LicenceDialogMode = "first" | "renew" | "correct";

export type LicenceDialogCopy = Record<
  LicenceDialogMode,
  { title: string; description: string; submit: string }
>;

/** The subset of a TanStack mutation the form needs. */
export type LicenceMutation<TVariables, TResult> = {
  mutateAsync: (variables: TVariables) => Promise<TResult>;
  isPending: boolean;
  error: unknown;
};

export type LicenceSaved<TResult> = {
  mode: LicenceDialogMode;
  response: TResult;
  /** Grade before the change (null for the first licence). */
  previousGrade: DrivingSchoolGrade | null;
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

const defaultValues = (
  mode: LicenceDialogMode,
  licence: Licence | null,
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
const changedFields = (values: LicenceInput, licence: Licence) => {
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

export type LicenceFormProps<TResult> = {
  mode: LicenceDialogMode;
  /** The current licence (ignored for `first`). */
  current: Licence | null;
  /** Classes now offered/qualified: used to warn before a lower grade. */
  selectedCodes: string[];
  classes: VehicleClass[];
  copy: LicenceDialogCopy;
  /** Follows "Grade X doesn't permit CE, DE." in the confirm step. */
  removalNote: ReactNode;
  numberPlaceholder?: string;
  mutations: {
    first: LicenceMutation<LicenceInput, TResult>;
    renew: LicenceMutation<LicenceInput, TResult>;
    correct: LicenceMutation<Partial<LicenceInput>, TResult>;
  };
  /**
   * Error codes that mean the dialog no longer applies: it closes and toasts
   * the message (if any). The hooks refetch stale data.
   */
  closingCodes: Record<string, string | null>;
  /** Called after closing for one of `closingCodes` (e.g. a plan-limit dialog). */
  onClosingError?: (code: string, error: unknown) => void;
  onDone: () => void;
  onSaved: (saved: LicenceSaved<TResult>) => void;
};

/** Licence number, grade and dates, with a lower-grade confirm step. */
export const LicenceForm = <TResult,>({
  mode,
  current,
  selectedCodes,
  classes,
  copy,
  removalNote,
  numberPlaceholder,
  mutations,
  closingCodes,
  onClosingError,
  onDone,
  onSaved,
}: LicenceFormProps<TResult>) => {
  const licence = mode === "first" ? null : current;
  const mutation = mutations[mode];
  const text = copy[mode];

  // Set when a lower grade would remove selected classes.
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
    if (code && code in closingCodes) {
      const message = closingCodes[code];
      if (message) toast.error(message);
      onDone();
      onClosingError?.(code, error);
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
    const previousGrade = mode === "first" ? null : (current?.grade ?? null);
    try {
      let response: TResult;
      if (mode === "correct" && licence) {
        const patch = changedFields(values, licence);
        if (Object.keys(patch).length === 0) {
          onDone();
          return;
        }
        response = await mutations.correct.mutateAsync(patch);
      } else {
        response = await mutations[mode === "first" ? "first" : "renew"].mutateAsync(
          values,
        );
      }
      onDone();
      onSaved({ mode, response, previousGrade });
    } catch (error) {
      onError(error);
    }
  };

  const onSubmit = (values: Form) => {
    if (mode !== "first" && current && values.grade !== current.grade) {
      const dropped = classesDroppedByGrade(selectedCodes, values.grade, classes);
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
            . {removalNote}
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

  const handledCodes = ["INVALID_LICENCE_DATES", ...Object.keys(closingCodes)];
  const alertError = handledCodes.includes(getApiErrorCode(mutation.error) ?? "")
    ? null
    : mutation.error;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{text.title}</DialogTitle>
        <DialogDescription>{text.description}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        <div className="grid gap-2">
          <Label htmlFor="licence-number">Licence number</Label>
          <Input
            id="licence-number"
            autoComplete="off"
            placeholder={numberPlaceholder}
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
          <SubmitButton pending={mutation.isPending}>{text.submit}</SubmitButton>
        </DialogFooter>
      </form>
    </>
  );
};

/**
 * Dialog frame. Render the feature's form body (which calls its mutation
 * hooks) as children, keyed per open so every open starts fresh.
 */
export const LicenceDialogFrame = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">{open && children}</DialogContent>
  </Dialog>
);
