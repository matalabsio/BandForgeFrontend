import { NextResponse } from "next/server";
import { getApiUrl, isApiUrlConfiguredForVercel } from "@/lib/api";

/** BFF connectivity check: Vercel → Railway API (use after deploy). */
export async function GET() {
  const api = getApiUrl();
  const config = isApiUrlConfiguredForVercel();

  if (!config.ok) {
    return NextResponse.json(
      {
        frontend: "ok",
        backend: "misconfigured",
        detail: config.detail,
        api_url: api,
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${api}/health`, { cache: "no-store" });
    const text = await res.text();
    let backendBody: unknown = text;
    try {
      backendBody = JSON.parse(text);
    } catch {
      /* plain text health response */
    }

    return NextResponse.json(
      {
        frontend: "ok",
        backend: res.ok ? "ok" : "error",
        status: res.status,
        api_url: api,
        backend_body: backendBody,
      },
      { status: res.ok ? 200 : 503 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "fetch failed";
    return NextResponse.json(
      {
        frontend: "ok",
        backend: "unreachable",
        detail: message,
        api_url: api,
      },
      { status: 503 },
    );
  }
}
