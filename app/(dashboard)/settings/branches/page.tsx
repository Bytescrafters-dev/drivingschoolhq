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
import { BranchesView } from "./components/branches-view";
import { BranchesTableSkeleton } from "./components/branches-table";

const BranchesPage = () => (
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
          <BreadcrumbPage>Branches</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    {/* BranchesView reads URL search params (?closed, ?view). */}
    <Suspense fallback={<BranchesTableSkeleton />}>
      <BranchesView />
    </Suspense>
  </div>
);

export default BranchesPage;
