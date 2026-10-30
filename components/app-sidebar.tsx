"use client";

import React from "react";
import { IconDashboard } from "@tabler/icons-react";

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
import { DASHBOARD } from "@/shared/constants/pageUrls";

// Central dashboard navigation. Add Administration / Customers sections here
// as those features are implemented.
const navMain = [
  {
    title: "Dashboard",
    url: DASHBOARD,
    icon: IconDashboard,
    collapsible: false,
    items: [],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: me } = useMe();

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
