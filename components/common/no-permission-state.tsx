import { LockIcon } from "lucide-react";

export const NoPermissionState = ({
  message = "You don't have permission to do this.",
}: {
  message?: string;
}) => (
  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
    <LockIcon className="text-muted-foreground size-6" aria-hidden />
    <p className="font-medium">Access restricted</p>
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);
