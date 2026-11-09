import type { ReactNode } from "react";
import { FileBadgeIcon, PencilIcon, RefreshCwIcon } from "lucide-react";
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
import { AMBER_BADGE, daysLeftLabel } from "@/components/licences/expiry";
import { formatCalendarDate, formatDateTime } from "@/lib/dates";
import { gradeLabel } from "@/shared/constants/grades";
import type { Licence, LicenceExpiry } from "@/types/licence";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="grid gap-1">
    <dt className="text-muted-foreground text-xs">{label}</dt>
    <dd className="flex flex-wrap items-center gap-2 text-sm font-medium break-words">
      {children}
    </dd>
  </div>
);

type Props = {
  title: string;
  description: string;
  licence: Licence | null;
  expiry?: LicenceExpiry;
  /** Renew / Edit details; omitted for read-only viewers. */
  onRenew?: () => void;
  onCorrect?: () => void;
  /** Shown without a licence (title, text, optional action button). */
  empty: { title: string; description: string; action?: ReactNode };
};

/** Current licence: number, grade, dates, and the Renew / Edit actions. */
export const LicenceCard = ({
  title,
  description,
  licence,
  expiry,
  onRenew,
  onCorrect,
  empty,
}: Props) => {
  const canChange = Boolean(onRenew || onCorrect);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {licence && canChange && (
          <CardAction className="flex flex-wrap gap-2">
            {onRenew && (
              <Button variant="outline" size="sm" onClick={onRenew}>
                <RefreshCwIcon />
                Renew licence
              </Button>
            )}
            {onCorrect && (
              <Button variant="ghost" size="sm" onClick={onCorrect}>
                <PencilIcon />
                Edit details
              </Button>
            )}
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
                {expiry?.kind === "expired" && (
                  <Badge variant="destructive">Expired</Badge>
                )}
                {expiry?.kind === "expiring" && (
                  <Badge className={AMBER_BADGE}>
                    Expires {daysLeftLabel(expiry.daysLeft)}
                  </Badge>
                )}
              </Field>
            </dl>
            {canChange && (
              <p className="text-muted-foreground text-xs">
                <strong className="font-medium">Renew</strong> when a new
                licence is issued: the current one stays in the history.{" "}
                <strong className="font-medium">Edit details</strong> only to
                fix a mistake.
                {licence.updatedAt !== licence.createdAt &&
                  ` Last corrected ${formatDateTime(licence.updatedAt)}.`}
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
            <FileBadgeIcon
              className="text-muted-foreground size-6"
              aria-hidden
            />
            <p className="font-medium">{empty.title}</p>
            <p className="text-muted-foreground max-w-sm text-sm">
              {empty.description}
            </p>
            {empty.action && <div className="mt-2">{empty.action}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
