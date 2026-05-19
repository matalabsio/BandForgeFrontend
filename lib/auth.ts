import {
  ApiError,
  parseApiError,
  parseJsonResponse,
  type ApiErrorBody,
} from "@/lib/api";
import {
  clearAccessToken,
  setAccessToken,
  type AuthUser,
} from "@/lib/session";

export type AuthResponse = {
  user: AuthUser;
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type MessageResponse = {
  ok?: boolean;
  message: string;
};

async function authFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api/auth/${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await parseJsonResponse<T | ApiErrorBody>(res);
  if (!res.ok) {
    throw new ApiError(parseApiError(body as ApiErrorBody, res.status), res.status);
  }
  return body as T;
}

function storeAccessFromAuth(data: AuthResponse): void {
  setAccessToken(data.access_token);
}

export async function register(input: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<MessageResponse> {
  return authFetch<MessageResponse>("register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Save phone/email to Supabase signup_leads (no MSG91 SMS yet). */
export async function collectLead(input: {
  phone?: string;
  email?: string;
  full_name?: string;
  channel?: string;
}): Promise<MessageResponse> {
  return authFetch<MessageResponse>("collect-lead", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>("login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  storeAccessFromAuth(data);
  return data;
}

export async function sendOtp(phone: string): Promise<MessageResponse> {
  return authFetch<MessageResponse>("send-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(input: {
  phone: string;
  code: string;
}): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>("verify-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
  storeAccessFromAuth(data);
  return data;
}

export async function verifyEmail(token: string): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>("verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  storeAccessFromAuth(data);
  return data;
}

export async function refreshSession(): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>("refresh", { method: "POST" });
  storeAccessFromAuth(data);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await authFetch<MessageResponse>("logout", { method: "POST" });
  } finally {
    clearAccessToken();
  }
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
  return authFetch<MessageResponse>("forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<MessageResponse> {
  return authFetch<MessageResponse>("reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getMe(): Promise<AuthUser> {
  return authFetch<AuthUser>("me", { method: "GET" });
}

export async function getServerUser(cookieHeader: string): Promise<AuthUser | null> {
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8000";
  try {
    const res = await fetch(`${base}/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}
