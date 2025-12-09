import { ReactNode } from "react";

interface MainShellProps {
  children: ReactNode;
}

export function MainShell({ children }: MainShellProps) {
  return (
    <main className="flex-1">
      <div className="container max-w-screen-xl py-8 px-4 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}

