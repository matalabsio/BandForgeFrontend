import { getApiUrl } from "@/lib/api";
import { fetchWithTimeout } from "@/lib/fetch-server";

export type MarketingHero = {
  configured: boolean;
  stream_uid: string;
  customer_code: string;
  poster_url: string;
  status: string;
  title: string;
};

export type ResolvedHero =
  | {
      kind: "ready";
      streamUid: string;
      customerCode: string;
      posterUrl: string | null;
    }
  | { kind: "processing" }
  | { kind: "empty" };

const ENV_UID = (process.env.NEXT_PUBLIC_HERO_STREAM_UID || "").trim();
const ENV_CUSTOMER = (
  process.env.NEXT_PUBLIC_HERO_STREAM_CUSTOMER ||
  process.env.NEXT_PUBLIC_STREAM_CUSTOMER_CODE ||
  ""
).trim();
const ENV_POSTER = (process.env.NEXT_PUBLIC_HERO_STREAM_POSTER || "").trim();

export function resolveHeroStream(api: MarketingHero | null): ResolvedHero {
  if (api?.configured && api.stream_uid.trim() && api.customer_code.trim()) {
    return {
      kind: "ready",
      streamUid: api.stream_uid.trim(),
      customerCode: api.customer_code.trim(),
      posterUrl: api.poster_url.trim() || null,
    };
  }
  if (
    api &&
    (api.status || "").toLowerCase() === "processing" &&
    api.stream_uid.trim()
  ) {
    return { kind: "processing" };
  }
  if (ENV_UID && ENV_CUSTOMER) {
    return {
      kind: "ready",
      streamUid: ENV_UID,
      customerCode: ENV_CUSTOMER,
      posterUrl: ENV_POSTER || null,
    };
  }
  return { kind: "empty" };
}

export async function fetchMarketingHero(): Promise<MarketingHero | null> {
  try {
    const res = await fetchWithTimeout(`${getApiUrl()}/api/marketing/hero`, {
      timeoutMs: 4000,
      next: { revalidate: 15 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as MarketingHero;
    if (!data || typeof data.configured !== "boolean") return null;
    return data;
  } catch {
    return null;
  }
}
