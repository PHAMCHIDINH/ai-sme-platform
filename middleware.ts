import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const session = req.auth;
  const role = session?.user?.role as string | undefined;

  // Đã đăng nhập mà vào trang gốc hoặc trang login/register → redirect vào dashboard
  const publicPaths = ["/", "/login", "/register"];
  const isPublicPath = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "?")
  );
  if (session && isPublicPath) {
    if (role === "SME") {
      return NextResponse.redirect(new URL("/sme/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }
  }

  // Chưa đăng nhập mà vào trang protected → redirect về login
  const isProtected =
    pathname.startsWith("/sme") || pathname.startsWith("/student");
  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Sai role → redirect về đúng dashboard
  if (session && pathname.startsWith("/sme") && role !== "SME") {
    return NextResponse.redirect(new URL("/student/dashboard", req.url));
  }
  if (session && pathname.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/sme/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/sme/:path*",
    "/student/:path*",
  ],
};