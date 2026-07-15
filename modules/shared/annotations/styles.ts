import type { AnnotationKind } from "@/modules/shared/annotations/types";

/** Visual classes for inline marks (underline / background). */
export function annotationMarkClass(kind: AnnotationKind): string {
  switch (kind) {
    case "strong":
      return "decoration-cyan bg-cyan/5 text-[#0D1F3C]";
    case "evidence_strength":
      return "bg-[#DCFCE7] text-[#166534] decoration-[#22C55E]";
    case "improve":
      return "decoration-[#FBBF24] bg-[#FFFBEB] text-[#92400E]";
    case "spelling":
      return "decoration-[#EF4444] bg-[#FEF2F2] text-[#991B1B]";
    case "grammar":
      return "decoration-[#F59E0B] bg-[#FFFBEB] text-[#92400E]";
    case "pronunciation":
      return "decoration-teal bg-[#ECFEFF] text-[#0F766E]";
    case "fluency_pause":
      return "decoration-[#67E8F9]/decoration-dotted bg-cyan/10 text-[#0E7490]";
    case "evidence_weakness":
      return "bg-[#FEE2E2] text-[#991B1B] decoration-[#EF4444]";
    default:
      return "decoration-[#94A3B8]";
  }
}

export function annotationDotClass(kind: AnnotationKind): string {
  switch (kind) {
    case "strong":
    case "evidence_strength":
      return "bg-[#22C55E]";
    case "improve":
    case "grammar":
      return "bg-[#F59E0B]";
    case "spelling":
    case "evidence_weakness":
      return "bg-[#EF4444]";
    case "pronunciation":
      return "bg-teal";
    case "fluency_pause":
      return "bg-cyan";
    default:
      return "bg-[#94A3B8]";
  }
}

export function annotationPopoverAccent(kind: AnnotationKind): string {
  switch (kind) {
    case "strong":
    case "fluency_pause":
      return "border-l-4 border-l-cyan";
    case "evidence_strength":
      return "border-l-4 border-l-[#22C55E]";
    case "improve":
      return "border-l-4 border-l-[#FBBF24]";
    case "spelling":
    case "evidence_weakness":
      return "border-l-4 border-l-[#EF4444]";
    case "grammar":
      return "border-l-4 border-l-[#F59E0B]";
    case "pronunciation":
      return "border-l-4 border-l-teal";
    default:
      return "border-l-4 border-l-[#94A3B8]";
  }
}
