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
