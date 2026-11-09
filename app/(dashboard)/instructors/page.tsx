import { Suspense } from "react";
import { InstructorsView } from "./components/instructors-view";
import { InstructorsTableSkeleton } from "./components/instructors-table";

const InstructorsPage = () => (
  <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
    {/* InstructorsView reads URL search params (?status). */}
    <Suspense fallback={<InstructorsTableSkeleton />}>
      <InstructorsView />
    </Suspense>
  </div>
);

export default InstructorsPage;
