import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const session = req.auth;

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/sme") && session.user.role !== "SME") {
    return NextResponse.redirect(new URL("/student/dashboard", req.url));
  }

  if (pathname.startsWith("/student") && session.user.role !== "STUDENT") {
    return NextResponse.redirect(new URL("/sme/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/sme/:path*", "/student/:path*"],
};