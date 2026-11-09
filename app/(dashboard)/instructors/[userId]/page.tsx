import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { InstructorProfileView } from "../components/instructor-profile-view";

type Props = { params: Promise<{ userId: string }> };

const InstructorPage = async ({ params }: Props) => {
  const { userId } = await params;
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      {/* Reads ?setup=1 after a profile was just created. */}
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        {/* Keyed so moving between people starts with fresh UI state. */}
        <InstructorProfileView key={userId} source={{ userId }} />
      </Suspense>
    </div>
  );
};

export default InstructorPage;
