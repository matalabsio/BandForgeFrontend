export type TutorTurn = {
  role: "user" | "assistant";
  content: string;
};

export type TutorSuggestion = {
  id: string;
  label: string;
  message: string;
};

export type TutorChatResponse = {
  reply: string;
  used_context: {
    attempt_id: string;
    band: number | null;
    has_essay: boolean;
    grammar_count: number;
    vocab_weak_count: number;
    prior_attempts: number;
    profile_weaknesses: number;
  };
  provider: string;
  stub: boolean;
};

export type TutorSuggestionsResponse = {
  suggestions: TutorSuggestion[];
};
