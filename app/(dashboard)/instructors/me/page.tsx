import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { InstructorProfileView } from "../components/instructor-profile-view";

/** The signed-in user's own instructor profile (static segment wins over [userId]). */
const MyInstructorProfilePage = () => (
  <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <InstructorProfileView source="me" />
    </Suspense>
  </div>
);

export default MyInstructorProfilePage;
