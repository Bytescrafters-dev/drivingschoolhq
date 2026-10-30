import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { SessionGate } from "@/components/auth/session-gate";
import { TenantAccessBanner } from "@/components/auth/tenant-access-banner";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SessionGate>
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
    </SessionGate>
  );
};

export default DashboardLayout;
