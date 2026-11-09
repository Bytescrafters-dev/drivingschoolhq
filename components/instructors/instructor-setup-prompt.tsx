"use client";

import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AMBER_ALERT } from "@/components/licences/expiry";
import { useMyInstructorProfile } from "@/hooks/instructors/useInstructors";
import { useMe } from "@/hooks/my-profile/useProfile";
import { MY_INSTRUCTOR_PROFILE } from "@/shared/constants/pageUrls";

/** For INSTRUCTOR-role users without a profile: prompt them to set it up. */
export const InstructorSetupPrompt = () => {
  const { data: me } = useMe();
  const isInstructorRole = me?.user.role === "INSTRUCTOR";
  const { data } = useMyInstructorProfile(isInstructorRole);

  if (!isInstructorRole || !data || data.profile || !data.canCreate) {
    return null;
  }

  return (
    <Alert className={AMBER_ALERT}>
      <AlertTriangleIcon />
      <AlertTitle>Set up your instructor profile</AlertTitle>
      <AlertDescription>
        <p>
          Add your instructor licence and the classes you teach so you can be
          assigned to training.
        </p>
        <Button asChild size="sm" variant="outline" className="mt-1">
          <Link href={MY_INSTRUCTOR_PROFILE}>Set up now</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
};
