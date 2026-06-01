"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, uploadProfileAvatar } from "@/lib/profile";
import type { AuthUser } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { normalizeIndiaMobile, formatIndiaDisplay } from "@/lib/india-mobile";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";

const BAND_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9] as const;

type Props = {
  user: AuthUser;
};

function phoneForInput(phone: string | null): string {
  if (!phone) return "";
  const digits = normalizeIndiaMobile(phone.replace(/^\+?91/, ""));
  return digits.length === 10 ? digits : phone;
}

export function ProfileForm({ user }: Props) {
  const { refresh } = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [phone, setPhone] = useState(phoneForInput(user.phone));
  const [targetBand, setTargetBand] = useState<number | "">(
    user.target_band ?? 7,
  );
  const [avatarPreview, setAvatarPreview] = useState(
    user.avatar_display_url ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initial = (fullName || user.email || "B").trim().charAt(0).toUpperCase();

  const onPickAvatar = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const onAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);
      setUploading(true);
      try {
        const preview = URL.createObjectURL(file);
        setAvatarPreview(preview);
        const updated = await uploadProfileAvatar(file);
        setAvatarPreview(updated.avatar_display_url ?? preview);
        setMessage("Profile photo updated.");
        refresh();
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Could not upload photo.",
        );
        setAvatarPreview(user.avatar_display_url ?? null);
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [refresh, user.avatar_display_url],
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setMessage(null);
      const name = fullName.trim();
      if (!name) {
        setError("Full name is required.");
        return;
      }
      setSaving(true);
      try {
        const updated = await updateProfile({
          full_name: name,
          phone: phone.trim() || null,
          target_band: targetBand === "" ? null : Number(targetBand),
        });
        setFullName(updated.full_name ?? name);
        if (updated.target_band != null) {
          setTargetBand(updated.target_band);
        }
        setMessage("Profile saved. Your dashboard target band is updated.");
        refresh();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("bf-profile-updated"));
        }
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Could not save profile.",
        );
      } finally {
        setSaving(false);
      }
    },
    [fullName, phone, targetBand, refresh],
  );

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={onPickAvatar}
          disabled={uploading}
          className="group relative flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-[#06B6D4]/30 bg-[#0F172A]/5 shadow-[0_8px_24px_rgba(6,182,212,0.2)] transition-transform hover:scale-[1.02] disabled:opacity-60"
          aria-label="Change profile photo"
        >
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-display text-3xl font-bold text-[#06B6D4]">
              {initial}
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 bg-[#0F172A]/60 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
            {uploading ? "…" : "Edit"}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={onAvatarChange}
        />
        <div className="text-center sm:text-left">
          <p className="text-[15px] font-semibold text-[#0F172A]">
            Profile photo
          </p>
          <p className="mt-1 text-[13px] text-[#0F172A]/55">
            JPEG, PNG, or WebP · max 2 MB
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            maxLength={120}
            autoComplete="name"
            className={inputClass}
            placeholder="Your name"
          />
        </Field>

        <Field label="Email" hint="From Google sign-in">
          <input
            type="email"
            value={user.email ?? ""}
            readOnly
            disabled
            className={`${inputClass} cursor-not-allowed opacity-70`}
          />
        </Field>

        <Field label="Mobile (India)" hint="Optional · 10 digits">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            inputMode="numeric"
            autoComplete="tel"
            className={inputClass}
            placeholder="9876543210"
          />
          {phone.length === 10 ? (
            <p className="mt-1 text-[11px] text-[#0F172A]/45">
              {formatIndiaDisplay(phone)}
            </p>
          ) : null}
        </Field>

        <Field label="Target IELTS band">
          <select
            value={targetBand}
            onChange={(e) =>
              setTargetBand(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className={inputClass}
          >
            {BAND_OPTIONS.map((b) => (
              <option key={b} value={b}>
                Band {b.toFixed(1)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <dl className="grid gap-3 rounded-2xl border border-[#0F172A]/6 bg-[#0F172A]/[0.02] p-4 text-[13px] sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0F172A]/40">
            Email verified
          </dt>
          <dd className="mt-0.5 font-medium">
            {user.email_verified ? "Yes" : "No"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0F172A]/40">
            Phone verified
          </dt>
          <dd className="mt-0.5 font-medium">
            {user.phone_verified ? "Yes" : "No"}
          </dd>
        </div>
      </dl>

      {error ? (
        <p className="text-[13px] font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <output className="block text-[13px] font-medium text-emerald-600">
          {message}
        </output>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-[#0F172A]/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-2xl bg-[#06B6D4] px-8 py-3 text-[14px] font-bold text-white transition-all hover:brightness-105 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
        <SignOutButton className="inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-2xl border border-[#0F172A]/12 bg-white px-6 py-3 text-[14px] font-semibold text-[#0F172A]/70 transition-colors hover:border-[#0F172A]/20 hover:text-[#0F172A]" />
      </div>
    </form>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#0F172A]/10 bg-white/80 px-4 py-2.5 text-[15px] text-[#0F172A] outline-none transition-shadow focus:border-[#06B6D4]/50 focus:ring-2 focus:ring-[#06B6D4]/20";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0F172A]/45">
        {label}
        {required ? <span className="text-[#06B6D4]"> *</span> : null}
      </label>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-[#0F172A]/40">{hint}</p>
      ) : null}
      {children}
    </div>
  );
}
