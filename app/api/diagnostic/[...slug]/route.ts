import { NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";
import { getApiUrl } from "@/lib/api";
import type { AuthResponse } from "@/lib/auth";
import {
  applyAuthCookiesToResponse,
  applyAuthTokensToResponse,
  collectSetCookieHeaders,
} from "@/lib/auth-cookies";
import { fetchWithTimeout } from "@/lib/fetch-server";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug?: string[] }> };

async function proxyGuestSession(req: Request): Promise<NextResponse> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const backendUrl = `${getApiUrl()}/api/diagnostic/guest-session`;

  let backendRes: Response;
  try {
    backendRes = await fetchWithTimeout(backendUrl, {
      method: "POST",
      headers: { cookie: cookieHeader, "Content-Type": "application/json" },
      cache: "no-store",
      timeoutMs: 15_000,
    });
  } catch {
    return NextResponse.json(
      {
        detail:
          "Cannot reach the API. Start the backend: uvicorn app.main:app --reload --host 127.0.0.1 --port 8000",
      },
      { status: 503 },
    );
  }

  const body = await backendRes.text();
  const res = new NextResponse(body, {
    status: backendRes.status,
    headers: {
      "Content-Type":
        backendRes.headers.get("content-type") ?? "application/json",
    },
  });

  applyAuthCookiesToResponse(res, collectSetCookieHeaders(backendRes.headers));

  if (backendRes.ok) {
    try {
      const parsed = JSON.parse(body) as AuthResponse;
      applyAuthTokensToResponse(res, parsed);
    } catch {
      /* body may not be JSON */
    }
  }

  return res;
}

async function handle(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const tail = slug?.length ? slug.join("/") : "";

  if (req.method === "POST" && tail === "guest-session") {
    return proxyGuestSession(req);
  }

  const path = tail ? `/api/diagnostic/${tail}` : "/api/diagnostic";
  return proxyToBackend(req, path);
}

export async function GET(req: Request, ctx: Ctx) {
  return handle(req, ctx);
}

export async function POST(req: Request, ctx: Ctx) {
  return handle(req, ctx);
}
