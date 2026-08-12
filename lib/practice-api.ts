import { examApiCall } from "@/lib/exam-api-call";
import type {
  HubCompleteResult,
  MockUnlock,
  PracticeHub,
  PracticeHubDetail,
  PracticeProgress,
  PracticeSkill,
} from "@/lib/practice-types";

export function getPracticeHubs(skill: PracticeSkill): Promise<PracticeHub[]> {
  return examApiCall<PracticeHub[]>(
    `/api/practice/hubs?skill=${encodeURIComponent(skill)}`,
  );
}

export function getPracticeHub(hubId: string): Promise<PracticeHubDetail> {
  return examApiCall<PracticeHubDetail>(
    `/api/practice/hubs/${encodeURIComponent(hubId)}`,
  );
}

export function completePracticeHub(hubId: string): Promise<HubCompleteResult> {
  return examApiCall<HubCompleteResult>(
    `/api/practice/hubs/${encodeURIComponent(hubId)}/complete`,
    {
      method: "POST",
    },
  );
}

export function getPracticeProgress(): Promise<PracticeProgress> {
  return examApiCall<PracticeProgress>("/api/practice/progress");
}

export function getMockUnlock(skill: PracticeSkill): Promise<MockUnlock> {
  return examApiCall<MockUnlock>(
    `/api/practice/mock-unlock?skill=${encodeURIComponent(skill)}`,
  );
}

export type BankExerciseStart = {
  attempt_id: string;
  hub_id: string;
  practice_set_id: string;
  skill: PracticeSkill;
  part: number;
  section: {
    section_id: string;
    part: number;
    module: PracticeSkill;
    title: string | null;
    instructions: string | null;
    audio_key: string | null;
    audio_url?: string | null;
    passage_text: string | null;
    image_url: string | null;
    questions: Array<{
      id: string;
      question_number: number;
      question_type: string;
      prompt: string;
      options: unknown;
      instructions?: string | null;
      audio_url?: string | null;
    }>;
  };
};

export type BankExerciseSubmitResult = {
  attempt_id: string;
  status: "completed";
  score: { correct: number; total: number; percent: number } | null;
  hub_completed: boolean;
};

export function startPracticeExercise(
  hubId: string,
  part?: number,
): Promise<BankExerciseStart> {
  const q =
    part !== undefined ? `?part=${encodeURIComponent(String(part))}` : "";
  return examApiCall<BankExerciseStart>(
    `/api/practice/hubs/${encodeURIComponent(hubId)}/exercise/start${q}`,
    { method: "POST" },
  );
}

export function submitPracticeExercise(
  hubId: string,
  attemptId: string,
  answers: Record<string, unknown>,
): Promise<BankExerciseSubmitResult> {
  return examApiCall<BankExerciseSubmitResult>(
    `/api/practice/hubs/${encodeURIComponent(hubId)}/exercise/${encodeURIComponent(attemptId)}/submit`,
    {
      method: "POST",
      body: JSON.stringify({ answers }),
    },
  );
}
