"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import {
  DASHBOARD,
  PRICE_PLAN_CREATE,
  PRICE_PLAN_UPDATE_PREFIX,
  PRICE_PLANS,
  TENANT_CREATE,
  TENANT_UPDATE_PREFIX,
  TENANTS,
} from "@/shared/constants/pageUrls";

const resolvePageHeader = (pathname: string) => {
  if (pathname.startsWith(`${PRICE_PLAN_UPDATE_PREFIX}/`)) {
    return "Price Plan Details";
  }
  if (pathname.startsWith(`${TENANT_UPDATE_PREFIX}/`)) {
    return "Tenant Details";
  }
  switch (pathname) {
    case DASHBOARD:
      return "Dashboard";
    case TENANTS:
      return "Tenants";
    case TENANT_CREATE:
      return "Create Tenant";
    case PRICE_PLANS:
      return "Price Plans";
    case PRICE_PLAN_CREATE:
      return "Create Price Plan";
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
        <div className="ml-auto text-base font-medium">Super Admin</div>
      </div>
    </header>
  );
}
