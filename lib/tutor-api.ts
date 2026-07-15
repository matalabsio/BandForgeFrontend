import { examApiCall } from "@/lib/exam-api-call";
import type {
  TutorChatResponse,
  TutorSuggestionsResponse,
  TutorTurn,
} from "@/lib/tutor-types";

const STORAGE_PREFIX = "bf_tutor_turns:";

export function loadTutorTurns(attemptId: string): TutorTurn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${attemptId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TutorTurn[];
    return Array.isArray(parsed) ? parsed.slice(-12) : [];
  } catch {
    return [];
  }
}

export function saveTutorTurns(attemptId: string, turns: TutorTurn[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${attemptId}`,
      JSON.stringify(turns.slice(-12)),
    );
  } catch {
    // ignore quota
  }
}

export async function tutorChat(input: {
  attemptId: string;
  message: string;
  selection?: string | null;
  turns?: TutorTurn[];
}): Promise<TutorChatResponse> {
  return examApiCall<TutorChatResponse>("/api/tutor/chat", {
    method: "POST",
    body: JSON.stringify({
      attempt_id: input.attemptId,
      message: input.message,
      selection: input.selection || null,
      turns: input.turns ?? [],
    }),
  });
}

export async function fetchTutorSuggestions(
  attemptId?: string | null,
): Promise<TutorSuggestionsResponse> {
  const q = attemptId
    ? `?attempt_id=${encodeURIComponent(attemptId)}`
    : "";
  return examApiCall<TutorSuggestionsResponse>(`/api/tutor/suggestions${q}`);
}
