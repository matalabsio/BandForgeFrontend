import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api";

type Ctx = { params: Promise<{ slug: string[] }> };

export async function POST(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const tail = slug.join("/");
  const backend = `${getApiUrl()}/api/attempts/${tail}`;
  const cookie = req.headers.get("cookie") ?? "";
  const res = await fetch(backend, {
    method: "POST",
    headers: {
      cookie,
      "Content-Type": req.headers.get("content-type") ?? "application/json",
    },
    cache: "no-store",
    body: await req.text(),
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
