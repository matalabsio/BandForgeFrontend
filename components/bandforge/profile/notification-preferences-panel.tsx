"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  canEnableSpeakingWhatsApp,
  speakingWhatsAppPreferencePatch,
} from "@/modules/speaking/lib/speaking-notification-preferences";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import type { SpeakingNotificationPreferences } from "@/modules/speaking/types";

export function NotificationPreferencesPanel() {
  const [preferences, setPreferences] =
    useState<SpeakingNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
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
    void load(controller.signal);
    return () => controller.abort();
  }, []);

  const patch = async (
    key: string,
    body:
      | { email_enabled: boolean }
      | { plan_reminders_email: boolean }
      | ReturnType<typeof speakingWhatsAppPreferencePatch>,
    successMessage: string,
  ) => {
    setSavingKey(key);
    setError(null);
    setSuccess(null);
    try {
      const updated = await speakingApi.updateNotificationPreferences(body);
      setPreferences(updated);
      setSuccess(successMessage);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update notification preferences.",
      );
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <section
      id="notification-preferences"
      className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby="notification-prefs-heading"
      aria-busy={loading || Boolean(savingKey)}
    >
      <header className="mb-6">
        <p className="font-mono text-[0.6875rem] tracking-wide text-cyan uppercase">
          Alerts
        </p>
        <h2
          id="notification-prefs-heading"
          className="font-display mt-1 flex items-center gap-2 text-lg font-bold text-navy"
        >
          <Bell className="size-5 text-cyan" aria-hidden />
          Notification preferences
        </h2>
        <p className="mt-1 text-sm text-muted">
          Choose which emails and WhatsApp alerts BandForge may send.
        </p>
      </header>

      {loading && !preferences ? (
        <p className="flex min-h-11 items-center gap-2 text-sm text-muted" role="status">
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          Loading preferences…
        </p>
      ) : preferences ? (
        <div className="space-y-6">
          <div className="flex gap-3 border-b border-border-soft pb-6">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cyan-soft text-teal"
              aria-hidden
            >
              <Mail className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-navy">Speaking report email</h3>
              <p className="mt-1 text-sm text-ink/65">
                Email when your examiner-reviewed Speaking report is released.
              </p>
              <Button
                variant={preferences.email_enabled ? "secondary" : "teal"}
                className="mt-3"
                disabled={savingKey === "email"}
                onClick={() =>
                  void patch(
                    "email",
                    { email_enabled: !preferences.email_enabled },
                    preferences.email_enabled
                      ? "Speaking report emails disabled."
                      : "Speaking report emails enabled.",
                  )
                }
              >
                {savingKey === "email"
                  ? "Saving…"
                  : preferences.email_enabled
                    ? "Disable email"
                    : "Enable email"}
              </Button>
            </div>
          </div>

          <div className="flex gap-3 border-b border-border-soft pb-6">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cyan-soft text-teal"
              aria-hidden
            >
              <Bell className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-navy">Daily plan reminder</h3>
              <p className="mt-1 text-sm text-ink/65">
                One email when you still have unfinished tasks on today&apos;s study plan.
              </p>
              <Button
                variant={preferences.plan_reminders_email ? "secondary" : "teal"}
                className="mt-3"
                disabled={savingKey === "plan"}
                onClick={() =>
                  void patch(
                    "plan",
                    {
                      plan_reminders_email: !preferences.plan_reminders_email,
                    },
                    preferences.plan_reminders_email
                      ? "Plan reminders disabled."
                      : "Plan reminders enabled.",
                  )
                }
              >
                {savingKey === "plan"
                  ? "Saving…"
                  : preferences.plan_reminders_email
                    ? "Disable reminders"
                    : "Enable reminders"}
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cyan-soft text-teal"
              aria-hidden
            >
              <MessageCircle className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-navy">WhatsApp report alert</h3>
              <p className="mt-1 text-sm text-ink/65">
                One transactional message when your Speaking report is released. Requires a
                verified phone number.
              </p>
              {preferences.whatsapp_enabled ? (
                <p className="mt-2 text-sm text-ink/70">
                  Alerts are on
                  {preferences.masked_phone ? ` for ${preferences.masked_phone}` : ""}.
                </p>
              ) : canEnableSpeakingWhatsApp(preferences) ? (
                <p className="mt-2 text-sm text-ink/70">
                  Your verified number
                  {preferences.masked_phone ? ` (${preferences.masked_phone})` : ""} is
                  eligible.
                </p>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  Add and verify a phone number in your account before enabling WhatsApp
                  alerts.
                </p>
              )}
              {preferences.whatsapp_enabled ? (
                <Button
                  variant="secondary"
                  className="mt-3"
                  disabled={savingKey === "whatsapp"}
                  onClick={() =>
                    void patch(
                      "whatsapp",
                      speakingWhatsAppPreferencePatch(false),
                      "WhatsApp release alerts are disabled.",
                    )
                  }
                >
                  {savingKey === "whatsapp" ? "Saving…" : "Disable WhatsApp alerts"}
                </Button>
              ) : canEnableSpeakingWhatsApp(preferences) ? (
                <Button
                  variant="teal"
                  className="mt-3"
                  disabled={savingKey === "whatsapp"}
                  onClick={() =>
                    void patch(
                      "whatsapp",
                      speakingWhatsAppPreferencePatch(true),
                      "WhatsApp release alerts are enabled.",
                    )
                  }
                >
                  {savingKey === "whatsapp" ? "Saving…" : "Enable WhatsApp alerts"}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          Try again
        </Button>
      )}

      <div className="mt-4 min-h-5 text-xs" aria-live="polite" aria-atomic="true">
        {error ? (
          <p className="text-danger" role="alert">
            {error}
          </p>
        ) : success ? (
          <p className="text-success" role="status">
            {success}
          </p>
        ) : null}
      </div>
    </section>
  );
}
