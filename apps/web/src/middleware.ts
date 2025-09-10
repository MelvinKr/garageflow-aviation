import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = [/^\/parts/, /^\/quotes/, /^\/workorders/, /^\/purchase-orders/];

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  if (PROTECTED.some((rx) => rx.test(url.pathname))) {
    const supa = req.cookies.get("sb-access-token") || req.cookies.get("sb:token");
    if (!supa) {
      const loginUrl = new URL("/auth", req.url);
      loginUrl.searchParams.set("next", url.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

