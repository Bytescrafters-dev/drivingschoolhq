import { FileBadgeIcon, PencilIcon, PlusIcon, RefreshCwIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AMBER_BADGE,
  daysLeftLabel,
} from "@/components/branches/branch-readiness-badges";
import { formatCalendarDate, formatDateTime } from "@/lib/dates";
import { gradeLabel } from "@/shared/constants/grades";
import type { BranchProfile } from "@/types/branch";
import type { LicenceDialogMode } from "./licence-dialog";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="grid gap-1">
    <dt className="text-muted-foreground text-xs">{label}</dt>
    <dd className="flex flex-wrap items-center gap-2 text-sm font-medium break-words">
      {children}
    </dd>
  </div>
);

type Props = {
  profile: BranchProfile;
  /** Set for managers on an open branch. */
  onOpenDialog?: (mode: LicenceDialogMode) => void;
};

export const LicenceCard = ({ profile, onOpenDialog }: Props) => {
  const licence = profile.currentLicence;
  const expiry = profile.readiness.warnings[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driving-school licence</CardTitle>
        <CardDescription>
          The licence grade decides which vehicle classes this branch may
          offer.
        </CardDescription>
        {licence && onOpenDialog && (
          <CardAction className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenDialog("renew")}>
              <RefreshCwIcon />
              Renew licence
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenDialog("correct")}>
              <PencilIcon />
              Edit details
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        {licence ? (
          <>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Licence number">{licence.licenceNumber}</Field>
              <Field label="Grade">{gradeLabel(licence.grade)}</Field>
              <Field label="Issued on">
                {formatCalendarDate(licence.issuedOn)}
              </Field>
              <Field label="Expires on">
                {formatCalendarDate(licence.expiresOn)}
                {expiry?.code === "BRANCH_LICENCE_EXPIRED" && (
                  <Badge variant="destructive">Expired</Badge>
                )}
                {expiry?.code === "BRANCH_LICENCE_EXPIRING" && (
                  <Badge className={AMBER_BADGE}>
                    Expires {daysLeftLabel(expiry.daysLeft)}
                  </Badge>
                )}
              </Field>
            </dl>
            {onOpenDialog && (
              <p className="text-muted-foreground text-xs">
                <strong className="font-medium">Renew</strong> when the DMT
                issues a new licence: the current one stays in the history.{" "}
                <strong className="font-medium">Edit details</strong> only to
                fix a mistake.
                {licence.updatedAt !== licence.createdAt &&
                  ` Last corrected ${formatDateTime(licence.updatedAt)}.`}
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
            <FileBadgeIcon className="text-muted-foreground size-6" aria-hidden />
            <p className="font-medium">No licence recorded</p>
            <p className="text-muted-foreground max-w-sm text-sm">
              Without a licence the branch has no grade, so it can&apos;t offer
              vehicle classes.
            </p>
            {onOpenDialog && (
              <Button size="sm" className="mt-2" onClick={() => onOpenDialog("first")}>
                <PlusIcon />
                Add licence
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
