"use client";

import Link from "next/link";
import {
  persistMockAttemptId,
  persistModuleResultAttempt,
} from "@/lib/exam-session-storage";
import type { ResultModule } from "@/lib/exam-session-storage";
import { mockTestIdForNumber } from "@/lib/mock-catalog";

type Props = {
  href: string;
  testNumber: number | null | undefined;
  module: ResultModule;
  attemptId: string | null | undefined;
  mockAttemptId?: string | null;
  className: string;
  children: React.ReactNode;
};

export function DashboardModuleProgressAction({
  href,
  testNumber,
  module,
  attemptId,
  mockAttemptId,
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
        if (mockAttemptId && testNumber != null) {
          persistMockAttemptId(mockTestIdForNumber(testNumber), mockAttemptId);
        }
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
