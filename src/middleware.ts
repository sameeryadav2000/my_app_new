// E:\my_app_new\src\middleware.ts

import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/homepage/login_signup", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/homepage/cart_page",
    "/homepage/shipping_page",
    "/homepage/protected/:path*",
  ],
};
