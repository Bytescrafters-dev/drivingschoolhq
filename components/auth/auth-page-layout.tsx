import type { ReactNode } from "react";
import Image from "next/image";
import { FileSliders } from "lucide-react";

/** Two-column layout shared by the sign-in and forced password-change pages. */
export const AuthPageLayout = ({
  header,
  children,
}: {
  /** Optional content on the right of the brand row (e.g. signed-in user). */
  header?: ReactNode;
  children: ReactNode;
}) => (
  <div className="grid min-h-svh lg:grid-cols-2">
    <div className="flex flex-col gap-4 p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-center gap-2 md:justify-between">
        <div className="flex items-center gap-2 font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <FileSliders className="size-4" aria-hidden />
          </div>
          Driving School HQ LK
        </div>
        {header}
      </div>
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-xs">{children}</div>
      </main>
    </div>
    <div className="bg-muted relative hidden lg:block">
      <Image
        src="/auth/loginFrame.png"
        alt=""
        fill
        sizes="50vw"
        priority
        className="object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
);
