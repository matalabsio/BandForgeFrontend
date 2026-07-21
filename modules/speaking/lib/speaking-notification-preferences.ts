import type {
  SpeakingNotificationPreferences,
  SpeakingNotificationPreferencesPatch,
} from "@/modules/speaking/types";

export const SPEAKING_WHATSAPP_CONSENT =
  "speaking_release_whatsapp_v1" as const;

export function canEnableSpeakingWhatsApp(
  preferences: Pick<SpeakingNotificationPreferences, "whatsapp_eligible">,
): boolean {
  return preferences.whatsapp_eligible;
}

export function speakingWhatsAppPreferencePatch(
  enabled: boolean,
): SpeakingNotificationPreferencesPatch {
  return enabled
    ? {
        whatsapp_enabled: true,
        consent_confirmation: SPEAKING_WHATSAPP_CONSENT,
      }
    : { whatsapp_enabled: false };
}
