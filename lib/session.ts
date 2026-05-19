export const ACCESS_COOKIE = "bf_access";
export const REFRESH_COOKIE = "bf_refresh";

let accessTokenMemory: string | null = null;

export function setAccessToken(token: string | null): void {
  accessTokenMemory = token;
}

export function getAccessToken(): string | null {
  return accessTokenMemory;
}

export function clearAccessToken(): void {
  accessTokenMemory = null;
}

export type AuthUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  email_verified: boolean;
  phone_verified: boolean;
};
