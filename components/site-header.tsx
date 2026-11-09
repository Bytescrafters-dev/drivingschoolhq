"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { BranchSwitcher } from "@/components/branches/branch-switcher";
import {
  DASHBOARD,
  MY_PROFILE,
  SETTINGS,
  SETTINGS_BRANCHES,
  SETTINGS_STAFF,
  INSTRUCTORS,
  MY_INSTRUCTOR_PROFILE,
} from "@/shared/constants/pageUrls";

const resolvePageHeader = (pathname: string) => {
  if (pathname.startsWith(SETTINGS_BRANCHES)) {
    return pathname.endsWith("/profile") ? "Branch profile" : "Branches";
  }
  if (pathname.startsWith(SETTINGS_STAFF)) return "Staff";
  if (pathname === MY_INSTRUCTOR_PROFILE) return "My instructor profile";
  if (pathname === INSTRUCTORS) return "Instructors";
  if (pathname.startsWith(`${INSTRUCTORS}/`)) return "Instructor";
  switch (pathname) {
    case DASHBOARD:
      return "Dashboard";
    case MY_PROFILE:
      return "My Profile";
    case SETTINGS:
      return "Settings";
    default:
      return "Dashboard";
  }
};

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">
          {resolvePageHeader(pathname ?? "")}
        </h1>
        <div className="ml-auto min-w-0">
          <BranchSwitcher />
        </div>
      </div>
    </header>
  );
}
