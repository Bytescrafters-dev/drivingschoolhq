"use client";

import Link from "next/link";
import { Building2Icon, ChevronRightIcon, UsersIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { TenantPermission } from "@/shared/constants/permissions";
import { SETTINGS_BRANCHES } from "@/shared/constants/pageUrls";

type Section = {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Omitted while the section isn't available yet. */
  href?: string;
};

const SectionCard = ({ title, description, icon: Icon, href }: Section) => {
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

export const SettingsSections = () => {
  const { hasPermission } = usePermissions();

  const sections: Section[] = [
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
