import { Suspense } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SETTINGS } from "@/shared/constants/pageUrls";
import { StaffView } from "./components/staff-view";
import { StaffTableSkeleton } from "./components/staff-table";

const StaffPage = () => (
  <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={SETTINGS}>Settings</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Staff</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    {/* StaffView reads URL search params (filters, page, ?view). */}
    <Suspense fallback={<StaffTableSkeleton />}>
      <StaffView />
    </Suspense>
  </div>
);

export default StaffPage;
