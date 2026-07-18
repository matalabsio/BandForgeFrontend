import type { SkillKey } from "@/lib/diagnostic-performance";
import { skillLabel } from "@/lib/diagnostic-performance";
import type { SkillDifficulty } from "@/lib/plan-preview";
import { cn } from "@/lib/utils";

type Props = {
  difficulty: Record<SkillKey, SkillDifficulty>;
  className?: string;
};

export function DiagnosticSkillTags({ difficulty, className }: Props) {
  const keys: SkillKey[] = ["listening", "reading", "writing", "speaking"];
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {keys.map((key) => {
        const tag = difficulty[key];
        const isHard = tag === "hard";
        return (
          <span
            key={key}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              isHard
                ? "bg-[#FEF2F2] text-[#B23B30]"
                : "bg-[#E6F7FA] text-[#0E6E78]",
            )}
          >
            {skillLabel(key)}
            <span className="font-mono text-[10px] uppercase opacity-80">
              {isHard ? "Hard" : "Easy"}
            </span>
          </span>
        );
      })}
    </div>
  );
}
