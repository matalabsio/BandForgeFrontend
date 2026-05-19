import { NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/auth-google";
import { ACCESS_COOKIE } from "@/lib/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Google sign-in was cancelled.");
    return NextResponse.redirect(loginUrl);
  }

  if (!code || !state) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Missing Google authorization.");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { data, setCookies } = await exchangeGoogleCode(code, state);
    const redirectUrl = new URL(data.redirect_to || "/dashboard", request.url);
    if (data.pending_verification) {
      return NextResponse.redirect(redirectUrl);
    }
    const res = NextResponse.redirect(redirectUrl);
    for (const raw of setCookies) {
      res.headers.append("Set-Cookie", raw);
    }
    const secure = process.env.NODE_ENV === "production";
    if (setCookies.length === 0 && data.access_token) {
      res.cookies.set(ACCESS_COOKIE, data.access_token, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      });
    }
    return res;
  } catch (e) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "error",
      e instanceof Error ? e.message : "Google sign-in failed.",
    );
    return NextResponse.redirect(loginUrl);
  }
}
