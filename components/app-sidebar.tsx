"use client";

import React from "react";
import { IconDashboard, IconSettings } from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useMe } from "@/hooks/my-profile/useProfile";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { TenantPermission } from "@/shared/constants/permissions";
import {
  DASHBOARD,
  SETTINGS,
  SETTINGS_BRANCHES,
  SETTINGS_STAFF,
} from "@/shared/constants/pageUrls";

// Central dashboard navigation. Add Administration / Customers sections here
// as those features are implemented. Permission-gated items are UX only.
const buildNav = (canManageStaff: boolean) => [
  {
    title: "Dashboard",
    url: DASHBOARD,
    icon: IconDashboard,
    collapsible: false,
    items: [],
  },
  {
    title: "Settings",
    url: SETTINGS,
    icon: IconSettings,
    collapsible: true,
    items: [
      { title: "Branches", url: SETTINGS_BRANCHES },
      ...(canManageStaff ? [{ title: "Staff", url: SETTINGS_STAFF }] : []),
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: me } = useMe();
  const { hasPermission } = usePermissions();
  const navMain = buildNav(hasPermission(TenantPermission.STAFF_MANAGE));

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href={DASHBOARD}>
                <span className="truncate text-xl font-semibold">
                  {me?.tenant.displayName ?? "Driving School HQ"}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
