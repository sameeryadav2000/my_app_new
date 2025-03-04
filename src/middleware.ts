// E:\my_app_new\src\middleware.ts

import { withAuth } from "next-auth/middleware";


export default withAuth({});

export const config = {
  matcher: [
    "/homepage/cart_page",
    "/homepage/shipping_page",
    "/homepage/payment_page",
    "/homepage/protected/:path*",
  ],
};
