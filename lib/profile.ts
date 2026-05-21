import {
  ApiError,
  parseApiError,
  parseJsonResponse,
  type ApiErrorBody,
} from "@/lib/api";
import type { AuthUser } from "@/lib/session";

export type UpdateProfileInput = {
  full_name: string;
  phone?: string | null;
  target_band?: number | null;
};

async function profileFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api/auth/${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
  });
  const body = await parseJsonResponse<T | ApiErrorBody>(res);
  if (!res.ok) {
    throw new ApiError(parseApiError(body as ApiErrorBody, res.status), res.status);
  }
  return body as T;
}

export async function updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
  return profileFetch<AuthUser>("profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: input.full_name,
      phone: input.phone ?? null,
      target_band: input.target_band ?? null,
    }),
  });
}

export async function uploadProfileAvatar(file: File): Promise<AuthUser> {
  const form = new FormData();
  form.append("file", file);
  return profileFetch<AuthUser>("profile/avatar", {
    method: "POST",
    body: form,
  });
}
