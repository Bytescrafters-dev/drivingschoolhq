"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Building2Icon,
  ChevronRightIcon,
  FileBadgeIcon,
  UsersIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useActiveBranch } from "@/components/branches/active-branch-provider";
import { BranchReadinessBadges } from "@/components/branches/branch-readiness-badges";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useBranches } from "@/hooks/branches/useBranches";
import { gradeLabel } from "@/shared/constants/grades";
import { TenantPermission } from "@/shared/constants/permissions";
import {
  SETTINGS_BRANCHES,
  SETTINGS_STAFF,
  settingsBranchProfile,
} from "@/shared/constants/pageUrls";
import type { BranchProfileSummary } from "@/types/branch";

type Section = {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Extra status line under the description. */
  extra?: ReactNode;
  /** Omitted while the section isn't available yet. */
  href?: string;
};

const SectionCard = ({
  title,
  description,
  icon: Icon,
  extra,
  href,
}: Section) => {
  const content = (
    <Card
      className={
        href
          ? "hover:bg-accent/50 h-full transition-colors"
          : "h-full opacity-60"
      }
    >
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="grid flex-1 gap-1">
          <CardTitle className="flex items-center gap-2">
            {title}
            {!href && <Badge variant="secondary">Coming soon</Badge>}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
          {extra}
        </div>
        {href && (
          <ChevronRightIcon
            className="text-muted-foreground size-5 shrink-0"
            aria-hidden
          />
        )}
      </CardHeader>
    </Card>
  );

  return href ? (
    <Link
      href={href}
      className="focus-visible:ring-ring rounded-xl focus-visible:ring-2 focus-visible:outline-none"
    >
      {content}
    </Link>
  ) : (
    <div aria-disabled="true">{content}</div>
  );
};

/** Grade, class count and readiness badges for the active branch's card. */
const ProfileSummary = ({ summary }: { summary: BranchProfileSummary }) => {
  const count = summary.offeredVehicleClasses.length;
  return (
    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
      {summary.grade && (
        <span>
          {gradeLabel(summary.grade)} · {count}{" "}
          {count === 1 ? "class" : "classes"}
        </span>
      )}
      <BranchReadinessBadges readiness={summary.readiness} />
    </div>
  );
};

export const SettingsSections = () => {
  const { hasPermission } = usePermissions();
  const { branch } = useActiveBranch();
  // Shares the Branches page's cache; only used for the summary line.
  const branches = useBranches(false);
  const summary = branches.data?.items.find((b) => b.id === branch?.id)
    ?.profile;

  const sections: Section[] = [
    ...(branch
      ? [
          {
            title: `${branch.name} profile`,
            description:
              "Driving-school licence, grade and the vehicle classes this branch offers.",
            icon: FileBadgeIcon,
            extra: summary && <ProfileSummary summary={summary} />,
            href: settingsBranchProfile(branch.id),
          },
        ]
      : []),
    {
      title: "Branches",
      description: "View your school's branches and choose your default.",
      icon: Building2Icon,
      href: SETTINGS_BRANCHES,
    },
    ...(hasPermission(TenantPermission.STAFF_MANAGE)
      ? [
          {
            title: "Staff",
            description: "Manage staff accounts, roles and branch access.",
            icon: UsersIcon,
            href: SETTINGS_STAFF,
          },
        ]
      : []),
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sections.map((section) => (
        <SectionCard key={section.title} {...section} />
      ))}
    </div>
  );
};
