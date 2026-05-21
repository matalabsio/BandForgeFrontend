import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";

type Ctx = { params: Promise<{ slug: string[] }> };

async function forward(req: Request, slug: string[]) {
  const tail = slug.join("/");
  const url = new URL(req.url);
  const backend = `${getApiUrl()}/api/dashboard/${tail}${url.search}`;
  const cookie = req.headers.get("cookie") ?? "";
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const init: RequestInit = {
    method: req.method,
    headers: {
      cookie,
      ...(hasBody
        ? { "Content-Type": req.headers.get("content-type") ?? "application/json" }
        : {}),
    },
    cache: "no-store",
    body: hasBody ? await req.text() : undefined,
  };
  const res = await fetch(backend, init);
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  return forward(req, slug);
}
