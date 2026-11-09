"use client";

import { useState } from "react";
import { CheckIcon, InfoIcon, Loader2Icon, PencilIcon, XIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { gradeRestriction } from "@/lib/vehicle-classes";
import { cn } from "@/lib/utils";
import type { VehicleClass } from "@/types/vehicle-class";

const ClassTile = ({
  vehicleClass,
  permitted,
  checked,
  onCheckedChange,
}: {
  vehicleClass: VehicleClass;
  permitted: boolean;
  checked: boolean;
  /** Present while editing. */
  onCheckedChange?: (checked: boolean) => void;
}) => {
  const id = `vehicle-class-${vehicleClass.code}`;
  const editable = Boolean(onCheckedChange);
  // Classes every grade permits need no restriction note.
  const restricted = !permitted && vehicleClass.permittedGrades.length < 3;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors",
        checked && "border-primary/60 bg-primary/5",
        !checked && !editable && "text-muted-foreground",
        editable && !permitted && "opacity-60",
      )}
    >
      {editable ? (
        <Checkbox
          id={id}
          className="mt-0.5"
          checked={checked}
          disabled={!permitted}
          onCheckedChange={(value) => onCheckedChange?.(value === true)}
          aria-describedby={restricted ? `${id}-restriction` : undefined}
        />
      ) : (
        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
          {checked ? (
            <CheckIcon className="text-primary size-4" aria-label="Offered" />
          ) : (
            <span className="sr-only">Not offered</span>
          )}
        </span>
      )}
      <div className="grid min-w-0 flex-1 gap-0.5">
        <Label
          htmlFor={editable ? id : undefined}
          className={cn(
            "flex flex-wrap items-baseline gap-x-2 font-normal",
            editable && permitted && "cursor-pointer",
          )}
        >
          <span className="font-semibold">{vehicleClass.code}</span>
          <span className="text-sm">{vehicleClass.name}</span>
        </Label>
        {restricted && (
          <span id={`${id}-restriction`} className="text-muted-foreground text-xs">
            {gradeRestriction(vehicleClass)}
          </span>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring -m-1 shrink-0 rounded p-1 focus-visible:ring-2 focus-visible:outline-none"
            aria-label={`About class ${vehicleClass.code}: ${vehicleClass.description}`}
          >
            <InfoIcon className="size-4" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">{vehicleClass.description}</TooltipContent>
      </Tooltip>
    </div>
  );
};

export type ClassSelectionSave = {
  /** Sends the full selection; call `onSettled(true)` to leave edit mode. */
  submit: (codes: string[], onSettled: (stopEditing: boolean) => void) => void;
  isPending: boolean;
};

type Props = {
  title: string;
  /** Under the title, e.g. "12 of 13 permitted classes offered." */
  description: string;
  /** All 13 classes, DMT order. */
  classes: VehicleClass[];
  /** What the current grade permits (empty without a licence). */
  permittedCodes: string[];
  /** Offered (branch) or qualified (instructor) codes. */
  selectedCodes: string[];
  hasLicence: boolean;
  canEdit: boolean;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  /** Guidance after a licence change (e.g. "untick what you don't offer"). */
  hint: string | null;
  onDismissHint: () => void;
  save: ClassSelectionSave;
  /** Accessible name of the checkbox group. */
  legend: string;
  /** Shown under the grid while editing. */
  editNote?: string;
  emptyConfirm: { title: string; description: string; confirm: string };
};

/** The 13-class grid: read-only, or a checklist limited to the grade. */
export const VehicleClassSelectionCard = ({
  title,
  description,
  classes,
  permittedCodes,
  selectedCodes,
  hasLicence,
  canEdit,
  editing,
  onEditingChange,
  hint,
  onDismissHint,
  save,
  legend,
  editNote,
  emptyConfirm,
}: Props) => {
  const permitted = new Set(permittedCodes);
  const isEditing = editing && canEdit && hasLicence;

  return (
    <Card id="vehicle-classes" className="scroll-mt-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {canEdit && hasLicence && !isEditing && (
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditingChange(true)}
            >
              <PencilIcon />
              Edit
            </Button>
          </CardAction>
        )}
      </CardHeader>
      {isEditing ? (
        // Mounted per edit session so the selection starts from the saved set.
        <ClassEditor
          classes={classes}
          permitted={permitted}
          initial={selectedCodes}
          hint={hint}
          onDismissHint={onDismissHint}
          onDone={() => onEditingChange(false)}
          save={save}
          legend={legend}
          editNote={editNote}
          emptyConfirm={emptyConfirm}
        />
      ) : (
        <CardContent className="grid gap-4">
          {hint && hasLicence && (
            <HintAlert hint={hint} onDismiss={onDismissHint} />
          )}
          <ClassGrid>
            {classes.map((vc) => (
              <ClassTile
                key={vc.code}
                vehicleClass={vc}
                permitted={permitted.has(vc.code)}
                checked={selectedCodes.includes(vc.code)}
              />
            ))}
          </ClassGrid>
        </CardContent>
      )}
    </Card>
  );
};

const ClassGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
);

const HintAlert = ({
  hint,
  onDismiss,
}: {
  hint: string;
  onDismiss: () => void;
}) => (
  <Alert role="status" className="pr-10">
    <InfoIcon />
    <AlertDescription className="text-foreground">{hint}</AlertDescription>
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-1.5 right-1.5 size-7"
      onClick={onDismiss}
      aria-label="Dismiss"
    >
      <XIcon />
    </Button>
  </Alert>
);

const ClassEditor = ({
  classes,
  permitted,
  initial,
  hint,
  onDismissHint,
  onDone,
  save,
  legend,
  editNote,
  emptyConfirm,
}: {
  classes: VehicleClass[];
  permitted: Set<string>;
  initial: string[];
  hint: string | null;
  onDismissHint: () => void;
  onDone: () => void;
  save: ClassSelectionSave;
  legend: string;
  editNote?: string;
  emptyConfirm: Props["emptyConfirm"];
}) => {
  const [selected, setSelected] = useState(() => new Set(initial));
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  // Only what the current grade permits is shown ticked, and sent. If the
  // grade changed underneath us, disabled classes drop out of the selection.
  const codes = classes
    .map((c) => c.code)
    .filter((code) => selected.has(code) && permitted.has(code));

  const toggle = (code: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(code);
      else next.delete(code);
      return next;
    });

  const submit = () =>
    save.submit(codes, (stopEditing) => {
      setConfirmEmpty(false);
      if (stopEditing) onDone();
    });

  const onSave = () => {
    if (codes.length === 0) setConfirmEmpty(true);
    else submit();
  };

  return (
    <>
      <CardContent className="grid gap-4">
        {hint && <HintAlert hint={hint} onDismiss={onDismissHint} />}
        <fieldset disabled={save.isPending}>
          <legend className="sr-only">{legend}</legend>
          <ClassGrid>
            {classes.map((vc) => (
              <ClassTile
                key={vc.code}
                vehicleClass={vc}
                permitted={permitted.has(vc.code)}
                checked={selected.has(vc.code) && permitted.has(vc.code)}
                onCheckedChange={(checked) => toggle(vc.code, checked)}
              />
            ))}
          </ClassGrid>
        </fieldset>
        {editNote && (
          <p className="text-muted-foreground text-xs">{editNote}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={save.isPending}>
          {save.isPending && <Loader2Icon className="animate-spin" />}
          Save classes
        </Button>
      </CardFooter>

      <AlertDialog open={confirmEmpty} onOpenChange={setConfirmEmpty}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{emptyConfirm.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {emptyConfirm.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={save.isPending}>
              Back
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={save.isPending}
              onClick={(event) => {
                // Keep the dialog open until the request settles.
                event.preventDefault();
                submit();
              }}
            >
              {save.isPending && <Loader2Icon className="animate-spin" />}
              {emptyConfirm.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
