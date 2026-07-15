import type { ListeningPart, ListeningQuestion } from "@/modules/listening/types";
import type { ReadingQuestion } from "@/modules/reading/types";

export type DiagnosticPackOption = {
  label: string;
  text: string;
};

export type DiagnosticPackQuestion = {
  id: string;
  number: number;
  type: string;
  prompt: string;
  options?: DiagnosticPackOption[];
  answer: string;
  skill?: string;
};

export type DiagnosticWritingTask = {
  id: string;
  part: number;
  minWords: number;
  title: string;
  prompt: string;
  diagramUrl?: string;
  /** Text description of the chart/diagram for AI Task Achievement scoring. */
  visualDescription?: string;
};

export type DiagnosticSpeakingPart1Question = {
  id: string;
  prompt: string;
  minSec: number;
  maxSec: number;
};

export type DiagnosticPack = {
  version: number;
  meta: {
    title: string;
    listeningMinutes: number;
    readingMinutes: number;
    writingMinutes: number;
    speakingMinutes?: number;
  };
  listening: {
    audioUrl?: string;
    transcript: string;
    questions: DiagnosticPackQuestion[];
  };
  reading: {
    title?: string;
    passage: string;
    questions: DiagnosticPackQuestion[];
  };
  writing: {
    tasks: DiagnosticWritingTask[];
  };
  speaking: {
    part1: {
      questions: DiagnosticSpeakingPart1Question[];
    };
    part2: {
      enabled?: boolean;
      cueCard: string;
      prepSec: number;
      recordSec: number;
      minRecordSec: number;
    };
  };
};

let cachedPack: DiagnosticPack | null = null;
let loadPromise: Promise<DiagnosticPack> | null = null;

function isPackOption(value: unknown): value is DiagnosticPackOption {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.label === "string" && typeof row.text === "string";
}

function isPackQuestion(value: unknown): value is DiagnosticPackQuestion {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string") return false;
  if (typeof row.number !== "number") return false;
  if (typeof row.type !== "string") return false;
  if (typeof row.prompt !== "string") return false;
  if (typeof row.answer !== "string") return false;
  if (row.options !== undefined) {
    if (!Array.isArray(row.options) || !row.options.every(isPackOption)) return false;
  }
  return true;
}

function parseWritingTasks(writing: Record<string, unknown>): DiagnosticWritingTask[] {
  if (Array.isArray(writing.tasks)) {
    return writing.tasks.map((task, index) => {
      const row = task as Record<string, unknown>;
      return {
        id: String(row.id ?? `W${index + 1}`),
        part: Number(row.part ?? index + 1),
        minWords: Number(row.minWords ?? (index === 0 ? 150 : 250)),
        title: String(row.title ?? `Writing Task ${index + 1}`),
        prompt: String(row.prompt ?? ""),
        diagramUrl:
          typeof row.diagramUrl === "string" ? row.diagramUrl : undefined,
        visualDescription:
          typeof row.visualDescription === "string"
            ? row.visualDescription
            : typeof row.visual_description === "string"
              ? row.visual_description
              : undefined,
      };
    });
  }
  return [
    {
      id: "W1",
      part: Number(writing.part ?? 1),
      minWords: Number(writing.minWords ?? 150),
      title: String(writing.title ?? "Writing Task 1"),
      prompt: String(writing.prompt ?? ""),
      diagramUrl:
        typeof writing.diagramUrl === "string" ? writing.diagramUrl : undefined,
      visualDescription:
        typeof writing.visualDescription === "string"
          ? writing.visualDescription
          : typeof writing.visual_description === "string"
            ? writing.visual_description
            : undefined,
    },
  ];
}

function parseSpeaking(speaking: unknown): DiagnosticPack["speaking"] {
  if (!speaking || typeof speaking !== "object") {
    return {
      part1: {
        questions: [
          {
            id: "S1",
            prompt: "Describe your hometown.",
            minSec: 30,
            maxSec: 45,
          },
        ],
      },
      part2: {
        enabled: false,
        cueCard: "",
        prepSec: 0,
        recordSec: 0,
        minRecordSec: 0,
      },
    };
  }
  const row = speaking as Record<string, unknown>;
  const part1 = row.part1 as Record<string, unknown> | undefined;
  const part2 = row.part2 as Record<string, unknown> | undefined;
  const questions = Array.isArray(part1?.questions)
    ? part1.questions.map((q, i) => {
        const item = q as Record<string, unknown>;
        return {
          id: String(item.id ?? `S${i + 1}`),
          prompt: String(item.prompt ?? ""),
          minSec: Number(item.minSec ?? 30),
          maxSec: Number(item.maxSec ?? 45),
        };
      })
    : [];
  return {
    part1: { questions },
    part2: {
      enabled:
        typeof part2?.enabled === "boolean"
          ? part2.enabled
          : Boolean(String(part2?.cueCard ?? "").trim()),
      cueCard: String(part2?.cueCard ?? ""),
      prepSec: Number(part2?.prepSec ?? 60),
      recordSec: Number(part2?.recordSec ?? 120),
      minRecordSec: Number(part2?.minRecordSec ?? 90),
    },
  };
}

export function parseDiagnosticPack(data: unknown): DiagnosticPack {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid diagnostic pack: not an object.");
  }
  const root = data as Record<string, unknown>;
  const meta = root.meta;
  const listening = root.listening;
  const reading = root.reading;
  const writing = root.writing;

  if (!meta || typeof meta !== "object") {
    throw new Error("Invalid diagnostic pack: missing meta.");
  }
  if (!listening || typeof listening !== "object") {
    throw new Error("Invalid diagnostic pack: missing listening.");
  }
  if (!reading || typeof reading !== "object") {
    throw new Error("Invalid diagnostic pack: missing reading.");
  }
  if (!writing || typeof writing !== "object") {
    throw new Error("Invalid diagnostic pack: missing writing.");
  }

  const listeningRow = listening as Record<string, unknown>;
  const readingRow = reading as Record<string, unknown>;
  const writingRow = writing as Record<string, unknown>;
  const metaRow = meta as Record<string, unknown>;

  const listeningQuestions = listeningRow.questions;
  const readingQuestions = readingRow.questions;

  if (!Array.isArray(listeningQuestions) || !listeningQuestions.every(isPackQuestion)) {
    throw new Error("Invalid diagnostic pack: listening questions.");
  }
  if (!Array.isArray(readingQuestions) || !readingQuestions.every(isPackQuestion)) {
    throw new Error("Invalid diagnostic pack: reading questions.");
  }

  return {
    version: typeof root.version === "number" ? root.version : 1,
    meta: {
      title: String(metaRow.title ?? "BandForge Free Diagnostic"),
      listeningMinutes: Number(metaRow.listeningMinutes ?? 20),
      readingMinutes: Number(metaRow.readingMinutes ?? 25),
      writingMinutes: Number(metaRow.writingMinutes ?? 25),
      speakingMinutes: Number(metaRow.speakingMinutes ?? 15),
    },
    listening: {
      audioUrl:
        typeof listeningRow.audioUrl === "string"
          ? listeningRow.audioUrl
          : undefined,
      transcript: String(listeningRow.transcript ?? ""),
      questions: listeningQuestions,
    },
    reading: {
      title:
        typeof readingRow.title === "string" ? readingRow.title : undefined,
      passage: String(readingRow.passage ?? ""),
      questions: readingQuestions,
    },
    writing: {
      tasks: parseWritingTasks(writingRow),
    },
    speaking: parseSpeaking(root.speaking),
  };
}

export async function loadDiagnosticPack(): Promise<DiagnosticPack> {
  if (cachedPack) return cachedPack;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const res = await fetch("/diagnostic/pack.json", { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Could not load diagnostic pack (${res.status}).`);
    }
    const data: unknown = await res.json();
    cachedPack = parseDiagnosticPack(data);
    return cachedPack;
  })();

  try {
    return await loadPromise;
  } finally {
    loadPromise = null;
  }
}

function mapListeningQuestionType(type: string): string {
  const t = type.toLowerCase();
  if (t === "multiple_choice") return "mcq";
  return t;
}

export function packToListeningPart(pack: DiagnosticPack): ListeningPart {
  const questions: ListeningQuestion[] = pack.listening.questions.map((q) => ({
    id: q.id,
    part: 1,
    question_number: q.number,
    display_number: q.number,
    question_type: mapListeningQuestionType(q.type),
    prompt: q.prompt,
    options: q.options ?? null,
    skill_tag: q.skill ?? null,
    audio_url: pack.listening.audioUrl ?? null,
  }));

  return {
    part: 1,
    title: "Section 1",
    context: "Diagnostic Listening",
    common_question_type: "mixed",
    questions,
  };
}

export function packToReadingQuestions(pack: DiagnosticPack): ReadingQuestion[] {
  return pack.reading.questions.map((q) => ({
    id: q.id,
    question_number: q.number,
    display_number: q.number,
    question_type: q.type,
    prompt: q.prompt,
    options: q.options ?? null,
    skill_tag: q.skill ?? null,
  }));
}
