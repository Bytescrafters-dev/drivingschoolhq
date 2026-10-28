"use client";

import React from "react";
import {
  IconBuildingCommunity,
  IconDashboard,
  IconTags,
} from "@tabler/icons-react";

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
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useTenantPermissions } from "@/hooks/tenants/useTenantPermissions";
import { PlatformPermission } from "@/shared/constants/permissions";
import {
  DASHBOARD,
  PRICE_PLAN_CREATE,
  PRICE_PLANS,
  TENANT_CREATE,
  TENANTS,
} from "@/shared/constants/pageUrls";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { hasPermission } = usePermissions();
  const canManagePlans = hasPermission(PlatformPermission.PLANS_MANAGE);
  const { manageLifecycle: canCreateTenants } = useTenantPermissions();

  const navMain = [
    {
      title: "Dashboard",
      url: DASHBOARD,
      icon: IconDashboard,
      collapsible: false,
      items: [],
    },
    {
      title: "Price Plans",
      url: PRICE_PLANS,
      icon: IconTags,
      collapsible: true,
      items: [
        ...(canManagePlans
          ? [{ title: "Create Price Plan", url: PRICE_PLAN_CREATE }]
          : []),
        { title: "View Price Plans", url: PRICE_PLANS },
      ],
    },
    {
      title: "Tenants",
      url: TENANTS,
      icon: IconBuildingCommunity,
      collapsible: true,
      items: [
        ...(canCreateTenants
          ? [{ title: "Create Tenant", url: TENANT_CREATE }]
          : []),
        { title: "View Tenants", url: TENANTS },
      ],
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="#">
                <span className="text-xl font-semibold">Super Admin</span>
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
