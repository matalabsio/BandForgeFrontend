"use client";

import { ExamPartFooter } from "@/components/exam/exam-part-footer";
import { memo } from "react";

type Props = {
  label: string;
  busy?: boolean;
  disabled?: boolean;
  onSubmit: () => void;
};

function ListeningPartFooterBase({ onSubmit, ...rest }: Props) {
  return <ExamPartFooter variant="listening" onAction={onSubmit} {...rest} />;
}

export const ListeningPartFooter = memo(ListeningPartFooterBase);
