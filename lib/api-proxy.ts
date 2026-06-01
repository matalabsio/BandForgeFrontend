import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";
import { ACCESS_COOKIE } from "@/lib/session";

/** Read a cookie value from the raw Cookie request header (Route Handlers). */
export function readCookieHeader(cookieHeader: string, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}

export async function proxyToBackend(
  req: Request,
  backendPath: string,
): Promise<NextResponse> {
  const startedAt = Date.now();
  const url = new URL(req.url);
  const backend = `${getApiUrl()}${backendPath.startsWith("/") ? backendPath : `/${backendPath}`}${url.search}`;
  const cookieHeader = req.headers.get("cookie") ?? "";
  const access = readCookieHeader(cookieHeader, ACCESS_COOKIE);
  const authorization = req.headers.get("authorization");

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const headers: Record<string, string> = { cookie: cookieHeader };
  if (authorization) {
    headers.Authorization = authorization;
  } else if (access) {
    headers.Authorization = `Bearer ${access}`;
  }
  if (hasBody) {
    headers["Content-Type"] =
      req.headers.get("content-type") ?? "application/json";
  }

  let res: Response;
  try {
    res = await fetch(backend, {
      method: req.method,
      headers,
      cache: "no-store",
      body: hasBody ? await req.text() : undefined,
    });
  } catch {
    console.info(
      JSON.stringify({
        route: backendPath,
        duration_ms: Date.now() - startedAt,
        cache_hit: false,
        cache_layer: "none",
        status: 503,
      }),
    );
    return NextResponse.json(
      {
        detail:
          "Cannot reach the API. Start the backend: uvicorn app.main:app --reload --host 127.0.0.1 --port 8000",
      },
      { status: 503 },
    );
  }

  const body = await res.text();
  console.info(
    JSON.stringify({
      route: backendPath,
      duration_ms: Date.now() - startedAt,
      cache_hit: false,
      cache_layer: "none",
      status: res.status,
    }),
  );
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
