import { proxyToBackend } from "@/lib/api-proxy";

type Ctx = { params: Promise<{ slug: string[] }> };

export async function GET(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const tail = slug.join("/");
  return proxyToBackend(req, `/api/learning/${tail}`);
}

export async function POST(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const tail = slug.join("/");
  return proxyToBackend(req, `/api/learning/${tail}`);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const tail = slug.join("/");
  return proxyToBackend(req, `/api/learning/${tail}`);
}
