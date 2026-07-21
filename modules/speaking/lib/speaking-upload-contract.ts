export type CreateSpeakingUploadInput = {
  questionId: string;
  part: 1 | 2 | 3;
  sequence: number;
  durationSec: number;
  contentType: string;
  contentLength: number;
  idempotencyKey: string;
};

export function createSpeakingUploadBody(input: CreateSpeakingUploadInput) {
  return {
    question_id: input.questionId,
    part: input.part,
    sequence_number: input.sequence,
    duration_sec: input.durationSec,
    content_type: input.contentType,
    size_bytes: input.contentLength,
    idempotency_key: input.idempotencyKey,
  };
}

export function confirmSpeakingUploadBody(input: {
  idempotencyKey: string;
  durationSec: number;
}) {
  return {
    idempotency_key: input.idempotencyKey,
    duration_sec: input.durationSec,
  };
}

export function finalizeSpeakingBody(manifestHash: string) {
  return { manifest_hash: manifestHash };
}
