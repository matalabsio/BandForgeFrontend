"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/bandforge/dashboard/icons";
import { Button } from "@/components/ui/button";
import {
  canEnableSpeakingWhatsApp,
  speakingWhatsAppPreferencePatch,
} from "@/modules/speaking/lib/speaking-notification-preferences";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import type { SpeakingNotificationPreferences } from "@/modules/speaking/types";

export function SpeakingWhatsAppPreference() {
  const [preferences, setPreferences] =
    useState<SpeakingNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      setPreferences(await speakingApi.notificationPreferences({ signal }));
    } catch (loadError) {
      if (loadError instanceof Error && loadError.name === "AbortError") return;
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load notification preferences.",
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    speakingApi
      .notificationPreferences({ signal: controller.signal })
      .then(setPreferences)
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load notification preferences.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const update = async (enabled: boolean) => {
    if (
      enabled &&
      preferences &&
      !canEnableSpeakingWhatsApp(preferences)
    ) {
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await speakingApi.updateNotificationPreferences(
        speakingWhatsAppPreferencePatch(enabled),
      );
      setPreferences(updated);
      setSuccess(
        enabled
          ? "WhatsApp release alerts are enabled."
          : "WhatsApp release alerts are disabled.",
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update WhatsApp alerts.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="mt-8 w-full rounded-2xl border border-border bg-white p-5 text-left shadow-soft"
      aria-labelledby="whatsapp-alert-heading"
      aria-busy={loading || saving}
    >
      <div className="flex gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e7f7ee] text-[#25D366]"
          aria-hidden
        >
          <WhatsAppIcon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="whatsapp-alert-heading" className="font-display text-base font-bold text-navy">
            WhatsApp report alert
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink/65">
            Get one transactional service message when your Speaking report is released.
            WhatsApp alerts require a verified phone number.
          </p>

          {loading && !preferences ? (
            <p className="mt-4 flex min-h-11 items-center gap-2 text-sm text-muted" role="status">
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
              Loading WhatsApp preference…
            </p>
          ) : preferences ? (
            <div className="mt-4">
              {preferences.whatsapp_enabled ? (
                <p className="text-sm text-ink/70">
                  Alerts are on
                  {preferences.masked_phone ? ` for ${preferences.masked_phone}` : ""}.
                </p>
              ) : canEnableSpeakingWhatsApp(preferences) ? (
                <p className="text-sm text-ink/70">
                  Your verified number
                  {preferences.masked_phone ? ` (${preferences.masked_phone})` : ""} is eligible.
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-ink/70">
                  Add and verify a phone number in your account before enabling WhatsApp alerts.
                </p>
              )}

              {preferences.whatsapp_enabled ? (
                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={() => void update(false)}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Disable WhatsApp alerts"}
                </Button>
              ) : canEnableSpeakingWhatsApp(preferences) ? (
                <Button
                  variant="teal"
                  className="mt-3"
                  onClick={() => void update(true)}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Enable WhatsApp alerts"}
                </Button>
              ) : null}
            </div>
          ) : (
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => void load()}
              disabled={loading}
            >
              Try again
            </Button>
          )}

          <div
            className="mt-2 min-h-5 text-xs"
            aria-live="polite"
            aria-atomic="true"
          >
            {error ? (
              <p className="text-danger" role="alert">{error}</p>
            ) : success ? (
              <p className="text-success" role="status">{success}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
