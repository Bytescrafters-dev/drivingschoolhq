import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { SessionGate } from "@/components/auth/session-gate";
import { TenantAccessBanner } from "@/components/auth/tenant-access-banner";
import { ActiveBranchProvider } from "@/components/branches/active-branch-provider";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SessionGate>
      <ActiveBranchProvider>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <TenantAccessBanner />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </ActiveBranchProvider>
    </SessionGate>
  );
};

export default DashboardLayout;
