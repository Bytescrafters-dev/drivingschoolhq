import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { InstructorBranch } from "@/types/instructor";
import { ClassChips } from "@/components/instructors/instructor-badges";

/** Where they teach (from their staff branch access) and what, per branch. */
export const InstructorBranchesCard = ({
  branches,
  hasProfile,
}: {
  branches: InstructorBranch[];
  hasProfile: boolean;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Branches</CardTitle>
      <CardDescription>
        Teaching at a branch is limited to the classes that branch offers.
        Branches come from their staff branch access.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {branches.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Not working in any open branch you can see.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {branches.map((branch) => (
            <li
              key={branch.id}
              className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium">{branch.name}</span>
              {hasProfile ? (
                <ClassChips codes={branch.teachableVehicleClasses} />
              ) : (
                <span className="text-muted-foreground text-sm">
                  Set up the profile first
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);
