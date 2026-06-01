import { proxyToBackend } from "@/lib/api-proxy";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug?: string[] }> };

async function handle(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const tail = slug?.length ? slug.join("/") : "";
  const path = tail ? `/api/mock-attempts/${tail}` : "/api/mock-attempts";
  return proxyToBackend(req, path);
}

export async function GET(req: Request, ctx: Ctx) {
  return handle(req, ctx);
}

export async function POST(req: Request, ctx: Ctx) {
  return handle(req, ctx);
}
