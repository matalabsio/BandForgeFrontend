import { proxyToBackend } from "@/lib/api-proxy";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string[] }> };

// Note: the Razorpay webhook (/api/payments/webhook) hits FastAPI directly and
// is intentionally NOT proxied through this BFF route.
async function handle(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const tail = slug.join("/");
  return proxyToBackend(req, `/api/payments/${tail}`);
}

export async function GET(req: Request, ctx: Ctx) {
  return handle(req, ctx);
}

export async function POST(req: Request, ctx: Ctx) {
  return handle(req, ctx);
}
