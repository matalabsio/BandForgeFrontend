export type AnnotationKind =
  | "strong"
  | "improve"
  | "spelling"
  | "grammar"
  | "pronunciation"
  | "fluency_pause"
  | "evidence_strength"
  | "evidence_weakness";

export type AnnotationSpan = {
  id: string;
  text: string;
  kind: AnnotationKind;
  title: string;
  body: string;
  suggestion?: string;
  /** Exact transcript offsets, preferred when the same quote occurs repeatedly. */
  start?: number;
  end?: number;
};

export const ANNOTATION_KIND_LABEL: Record<AnnotationKind, string> = {
  strong: "Strong",
  improve: "Improve",
  spelling: "Spelling",
  grammar: "Grammar",
  pronunciation: "Pronunciation",
  fluency_pause: "Fluency pause",
  evidence_strength: "Strength",
  evidence_weakness: "Needs work",
};
