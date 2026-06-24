import type { DiagnosticPack } from "@/lib/diagnostic-pack";
import {
  aggregateBand,
  buildModuleReview,
  scoreListeningModule,
  scoreReadingModule,
  scoreSpeakingModule,
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
  const writingBand = progress.writingEvaluation?.writing_band ?? null;
  const speakingScore = scoreSpeakingModule({
    part1Questions: pack.speaking.part1.questions.map((q) => ({
      id: q.id,
      minSec: q.minSec,
    })),
    part2MinSec: pack.speaking.part2.minRecordSec,
    part2Enabled: pack.speaking.part2.enabled,
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
    writing_band: writingBand,
    speaking_band: speakingScore.band,
    aggregate_band: aggregateBand(
      listeningScore.band,
      readingScore.band,
      writingBand,
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
