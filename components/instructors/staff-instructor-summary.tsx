"use client";

import Link from "next/link";
import { ProfileStatusBadge } from "@/components/instructors/instructor-badges";
import { useInstructor } from "@/hooks/instructors/useInstructors";
import { gradeLabel } from "@/shared/constants/grades";
import { instructorProfile } from "@/shared/constants/pageUrls";

/**
 * "Instructor profile" value for a staff member: status, grade and a link.
 * A 404 means no profile (and not an INSTRUCTOR), shown as "None".
 */
export const StaffInstructorSummary = ({ userId }: { userId: string }) => {
  const { data, isPending, isError } = useInstructor(userId);

  if (isPending) return <span className="text-muted-foreground">Loading…</span>;
  if (isError || !data) return <span>None</span>;

  return (
    <span className="flex flex-wrap items-center gap-2">
      <ProfileStatusBadge status={data.profileStatus} />
      {data.profile?.grade && <span>{gradeLabel(data.profile.grade)}</span>}
      <Link
        href={instructorProfile(userId)}
        className="underline underline-offset-4"
      >
        Open
      </Link>
    </span>
  );
};
