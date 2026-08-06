"use client";

import { useEffect, useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  BellIcon,
  CalendarIcon,
  MailIcon,
  WhatsAppIcon,
} from "@/components/bandforge/dashboard/icons";
import { cn } from "@/lib/utils";
import {
  canEnableSpeakingWhatsApp,
  speakingWhatsAppPreferencePatch,
} from "@/modules/speaking/lib/speaking-notification-preferences";
import { speakingApi } from "@/modules/speaking/services/speaking-api";
import type { SpeakingNotificationPreferences } from "@/modules/speaking/types";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type PrefRowProps = {
  icon: IconType;
  iconClassName?: string;
  title: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  saving?: boolean;
  onToggle: () => void;
  footer?: ReactNode;
};

function PreferenceToggle({
  enabled,
  disabled,
  saving,
  onToggle,
  label,
}: {
  enabled: boolean;
  disabled?: boolean;
  saving?: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled || saving}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "motion-reduce:transition-none",
        enabled ? "bg-teal" : "bg-ink/15",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform duration-200",
          "motion-reduce:transition-none",
          enabled && "translate-x-5",
        )}
      />
    </button>
  );
}

function PreferenceRow({
  icon: Icon,
  iconClassName,
  title,
  description,
  enabled,
  disabled,
  saving,
  onToggle,
  footer,
}: PrefRowProps) {
  return (
    <div className="flex gap-3.5 py-5 first:pt-0 last:pb-0">
      <span
        className={cn(
          "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-soft text-teal",
          iconClassName,
        )}
        aria-hidden
      >
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[0.9375rem] font-semibold text-navy">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
          </div>
          <PreferenceToggle
            enabled={enabled}
            disabled={disabled}
            saving={saving}
            onToggle={onToggle}
            label={`${enabled ? "Disable" : "Enable"} ${title}`}
          />
        </div>
        {footer ? <div className="mt-2.5">{footer}</div> : null}
      </div>
    </div>
  );
}

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

  const whatsappEligible = preferences
    ? canEnableSpeakingWhatsApp(preferences)
    : false;

  return (
    <section
      id="notification-preferences"
      className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby="notification-prefs-heading"
      aria-busy={loading || Boolean(savingKey)}
    >
      <header className="mb-2">
        <p className="font-mono text-[0.6875rem] tracking-wide text-cyan uppercase">
          Alerts
        </p>
        <h2
          id="notification-prefs-heading"
          className="font-display mt-1 flex items-center gap-2.5 text-lg font-bold text-navy"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-cyan-soft text-teal">
            <BellIcon className="size-4" />
          </span>
          Notification preferences
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          Choose which emails and WhatsApp alerts BandForge may send.
        </p>
      </header>

      {loading && !preferences ? (
        <p
          className="mt-6 flex min-h-11 items-center gap-2 text-sm text-muted"
          role="status"
        >
          <Loader2
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden
          />
          Loading preferences…
        </p>
      ) : preferences ? (
        <div className="mt-4 divide-y divide-border-soft">
          <PreferenceRow
            icon={MailIcon}
            title="Speaking report email"
            description="Email when your examiner-reviewed Speaking report is released."
            enabled={preferences.email_enabled}
            saving={savingKey === "email"}
            onToggle={() =>
              void patch(
                "email",
                { email_enabled: !preferences.email_enabled },
                preferences.email_enabled
                  ? "Speaking report emails disabled."
                  : "Speaking report emails enabled.",
              )
            }
          />

          <PreferenceRow
            icon={CalendarIcon}
            title="Daily plan reminder"
            description="One email when you still have unfinished tasks on today's study plan."
            enabled={preferences.plan_reminders_email}
            saving={savingKey === "plan"}
            onToggle={() =>
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
          />

          <PreferenceRow
            icon={WhatsAppIcon}
            iconClassName="bg-[#e7f7ee] text-[#25D366]"
            title="WhatsApp report alert"
            description="One transactional message when your Speaking report is released. Requires a verified phone number."
            enabled={preferences.whatsapp_enabled}
            disabled={!preferences.whatsapp_enabled && !whatsappEligible}
            saving={savingKey === "whatsapp"}
            onToggle={() => {
              if (preferences.whatsapp_enabled) {
                void patch(
                  "whatsapp",
                  speakingWhatsAppPreferencePatch(false),
                  "WhatsApp release alerts are disabled.",
                );
                return;
              }
              if (!whatsappEligible) return;
              void patch(
                "whatsapp",
                speakingWhatsAppPreferencePatch(true),
                "WhatsApp release alerts are enabled.",
              );
            }}
            footer={
              preferences.whatsapp_enabled ? (
                <p className="text-sm text-muted">
                  Alerts are on
                  {preferences.masked_phone
                    ? ` for ${preferences.masked_phone}`
                    : ""}
                  .
                </p>
              ) : whatsappEligible ? (
                <p className="text-sm text-muted">
                  Your verified number
                  {preferences.masked_phone
                    ? ` (${preferences.masked_phone})`
                    : ""}{" "}
                  is eligible.
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-muted">
                  <Link
                    href="#account-form"
                    className="font-medium text-teal underline-offset-2 hover:underline"
                  >
                    Add and verify a phone number
                  </Link>{" "}
                  in your account before enabling WhatsApp alerts.
                </p>
              )
            }
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-teal hover:bg-surface disabled:opacity-50"
        >
          Try again
        </button>
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
