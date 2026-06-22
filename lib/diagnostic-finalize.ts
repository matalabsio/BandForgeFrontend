import type { DiagnosticPack } from "@/lib/diagnostic-pack";
import {
  aggregateBand,
  buildModuleReview,
  scoreListeningModule,
  scoreReadingModule,
  scoreSpeakingModule,
  scoreWritingTasks,
} from "@/lib/diagnostic-scoring";
import type { DiagnosticModuleScores } from "@/lib/diagnostic-storage";
import type { DiagnosticProgress } from "@/lib/diagnostic-storage";

export function computeFinalDiagnosticScores(
  pack: DiagnosticPack,
  progress: DiagnosticProgress,
): {
  scores: DiagnosticModuleScores;
  review: NonNullable<DiagnosticProgress["review"]>;
} {
  const listeningScore = scoreListeningModule(
    pack.listening.questions,
    progress.answers.listening,
  );
  const readingScore = scoreReadingModule(
    pack.reading.questions,
    progress.answers.reading,
  );
  const writingScore = scoreWritingTasks(
    progress.answers.writing,
    pack.writing.tasks.map((t) => ({
      id: t.id,
      part: t.part,
      minWords: t.minWords,
    })),
  );
  const speakingScore = scoreSpeakingModule({
    part1Questions: pack.speaking.part1.questions.map((q) => ({
      id: q.id,
      minSec: q.minSec,
    })),
    part2MinSec: pack.speaking.part2.minRecordSec,
    answers: progress.answers.speaking,
  });

  const listeningReview = buildModuleReview(
    pack.listening.questions,
    progress.answers.listening,
  );
  const readingReview = buildModuleReview(
    pack.reading.questions,
    progress.answers.reading,
  );

  const scores: DiagnosticModuleScores = {
    listening_band: listeningScore.band,
    reading_band: readingScore.band,
    writing_band: writingScore.band,
    speaking_band: speakingScore.band,
    aggregate_band: aggregateBand(
      listeningScore.band,
      readingScore.band,
      writingScore.band,
      speakingScore.band,
    ),
  };

  return {
    scores,
    review: {
      listening: listeningReview,
      reading: readingReview,
    },
  };
}
