"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileStatusBadge } from "@/components/instructors/instructor-badges";
import { useMyInstructorProfile } from "@/hooks/instructors/useInstructors";
import { gradeLabel } from "@/shared/constants/grades";
import { MY_INSTRUCTOR_PROFILE } from "@/shared/constants/pageUrls";

/** Own instructor profile summary, or the "Do you teach?" prompt. */
export const InstructorProfileCard = () => {
  const { data, isPending, isError, refetch, isFetching } =
    useMyInstructorProfile();

  if (isPending) {
    return (
      <Card>
        <CardContent className="grid gap-3" aria-busy="true">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-full" />
          <span className="sr-only">Loading instructor profile</span>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Instructor profile</CardTitle>
          <CardDescription>Couldn&apos;t load your instructor profile.</CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Retry
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    );
  }

  // No profile and not allowed to create one: nothing to offer.
  if (!data.profile && !data.canCreate) return null;

  if (!data.profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Do you teach?</CardTitle>
          <CardDescription>
            Set up your instructor profile with your instructor licence so you
            can be assigned to training.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={MY_INSTRUCTOR_PROFILE}>Set up instructor profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const count = data.qualifiedVehicleClasses.length;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructor profile</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <ProfileStatusBadge status={data.profileStatus} />
          {data.profile.grade && <span>{gradeLabel(data.profile.grade)}</span>}
          <span>
            · Qualified for {count} {count === 1 ? "class" : "classes"}
          </span>
        </CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm">
            <Link href={MY_INSTRUCTOR_PROFILE}>Open</Link>
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  );
};
