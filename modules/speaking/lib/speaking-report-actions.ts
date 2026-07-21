export const SPEAKING_COACHING_PATH = "/pricing";

export const SPEAKING_SHARE_TITLE = "BandForge Speaking feedback";
export const SPEAKING_SHARE_TEXT =
  "Private BandForge Speaking report. Only the same BandForge account can open this link.";

export type SpeakingSharePayload = {
  title: string;
  text: string;
  url: string;
};

export type SpeakingShareResult = "shared" | "copied" | "cancelled";

type ShareCapabilities = {
  share?: (payload: SpeakingSharePayload) => Promise<void>;
  writeText?: (text: string) => Promise<void>;
};

export function speakingSharePayload(url: string): SpeakingSharePayload {
  return {
    title: SPEAKING_SHARE_TITLE,
    text: SPEAKING_SHARE_TEXT,
    url,
  };
}

export function isShareCancellation(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function shareSpeakingReport(
  url: string,
  capabilities: ShareCapabilities,
): Promise<SpeakingShareResult> {
  if (capabilities.share) {
    try {
      await capabilities.share(speakingSharePayload(url));
      return "shared";
    } catch (error) {
      if (isShareCancellation(error)) return "cancelled";
      throw error;
    }
  }

  if (!capabilities.writeText) {
    throw new Error("Sharing is not supported by this browser.");
  }
  await capabilities.writeText(url);
  return "copied";
}

export function printSpeakingReport(print: () => void): void {
  print();
}
