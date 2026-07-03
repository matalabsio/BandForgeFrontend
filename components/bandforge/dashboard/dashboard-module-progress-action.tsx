"use client";

import Link from "next/link";
import { persistModuleResultAttempt } from "@/lib/exam-session-storage";
import type { ResultModule } from "@/lib/exam-session-storage";

type Props = {
  href: string;
  testNumber: number | null | undefined;
  module: ResultModule;
  attemptId: string | null | undefined;
  className: string;
  children: React.ReactNode;
};

export function DashboardModuleProgressAction({
  href,
  testNumber,
  module,
  attemptId,
  className,
  children,
}: Props) {
  return (
    <Link
      href={href}
      onClick={() => {
        if (attemptId && testNumber != null) {
          persistModuleResultAttempt(testNumber, module, attemptId);
        }
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
