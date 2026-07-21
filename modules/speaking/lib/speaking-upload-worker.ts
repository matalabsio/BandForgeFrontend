import { ApiError } from "@/lib/api";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import type { ExpectedSpeakingResponse } from "./speaking-response-state";

export type SpeakingUploadJob = ExpectedSpeakingResponse & {
  attemptId: string;
  audio: Blob;
  durationSec: number;
  idempotencyKey: string;
};

type WorkerEvents = {
  onStart?: (job: SpeakingUploadJob) => void;
  onOffline?: (job: SpeakingUploadJob) => void;
  onSuccess?: (job: SpeakingUploadJob) => void;
  onFailure?: (job: SpeakingUploadJob, error: unknown) => void;
};

function supportsDirectFallback(error: unknown): boolean {
  return (
    error instanceof TypeError ||
    (error instanceof ApiError && [404, 405, 501].includes(error.status))
  );
}

/** A single-consumer queue. Audio stays in memory and jobs always run in enqueue order. */
export class SpeakingUploadWorker {
  private queue: Array<{
    job: SpeakingUploadJob;
    resolve: () => void;
    reject: (error: unknown) => void;
  }> = [];
  private running = false;

  constructor(private readonly events: WorkerEvents = {}) {}

  enqueue(job: SpeakingUploadJob): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ job, resolve, reject });
      void this.drain();
    });
  }

  private async upload(job: SpeakingUploadJob): Promise<void> {
    try {
      const contentType =
        job.audio.type.toLowerCase().split(";", 1)[0].trim() || "application/octet-stream";
      const session = await speakingApi.createResponseUploadSession(job.attemptId, {
        questionId: job.questionId,
        part: job.part,
        sequence: job.sequence,
        durationSec: job.durationSec,
        contentType,
        contentLength: job.audio.size,
        idempotencyKey: job.idempotencyKey,
      });
      if (session.upload_url) {
        await speakingApi.putSignedResponse(session.upload_url, job.audio, {
          "Content-Type": contentType,
        });
      }
      await speakingApi.confirmResponseUpload(job.attemptId, session.response_id, {
        idempotencyKey: session.idempotency_key,
        durationSec: job.durationSec,
      });
    } catch (error) {
      if (!supportsDirectFallback(error)) throw error;
      await speakingApi.uploadResponse(job.attemptId, {
        questionId: job.questionId,
        part: job.part,
        sequence: job.sequence,
        durationSec: job.durationSec,
        audio: job.audio,
      });
    }
  }

  private async uploadWhenOnline(job: SpeakingUploadJob): Promise<void> {
    for (;;) {
      try {
        await this.upload(job);
        return;
      } catch (error) {
        if (typeof navigator === "undefined" || navigator.onLine) throw error;
        this.events.onOffline?.(job);
        await new Promise<void>((resolve) => {
          window.addEventListener("online", () => resolve(), { once: true });
        });
      }
    }
  }

  private async drain(): Promise<void> {
    if (this.running) return;
    this.running = true;
    while (this.queue.length > 0) {
      const entry = this.queue.shift()!;
      this.events.onStart?.(entry.job);
      try {
        await this.uploadWhenOnline(entry.job);
        this.events.onSuccess?.(entry.job);
        entry.resolve();
      } catch (error) {
        this.events.onFailure?.(entry.job, error);
        entry.reject(error);
      }
    }
    this.running = false;
  }
}
