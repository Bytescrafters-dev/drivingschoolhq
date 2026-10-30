"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useMe } from "@/hooks/my-profile/useProfile";
import { DASHBOARD, MY_PROFILE } from "@/shared/constants/pageUrls";

const resolvePageHeader = (pathname: string) => {
  switch (pathname) {
    case DASHBOARD:
      return "Dashboard";
    case MY_PROFILE:
      return "My Profile";
    default:
      return "Dashboard";
  }
};

export function SiteHeader() {
  const pathname = usePathname();
  const { data: me } = useMe();

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
        {me && (
          <div className="text-muted-foreground ml-auto hidden truncate text-sm font-medium sm:block">
            {me.tenant.displayName}
          </div>
        )}
      </div>
    </header>
  );
}
