/** Server boot payload types — keep out of mock-server so client components stay server-free. */

export type ListeningBootServer = {
  attempt_id: string;
  started_at: string;
  server_time: string;
  status: string;
  duration_seconds: number;
  resumed: boolean;
  test?: { id: string; title: string; description?: string | null };
  parts?: Array<{
    part: number;
    title: string;
    context: string;
    common_question_type: string;
    questions: unknown[];
  }>;
};

export type ReadingBootServer = {
  attempt_id: string;
  started_at: string;
  server_time: string;
  status: string;
  duration_seconds: number;
  resumed: boolean;
  passage_text?: string | null;
  questions?: unknown[];
  test?: { id: string; title: string; description?: string | null };
};

export type WritingBootServer = {
  attempt_id: string;
  started_at: string;
  server_time: string;
  status: string;
  part: number;
  duration_seconds: number;
  resumed: boolean;
  task?: unknown;
  saved_answer?: string | null;
  test?: { id: string; title: string; description?: string | null };
};
