// E:\my_app_new\src\middleware.ts

import { withAuth } from "next-auth/middleware";

export default withAuth({});

export const config = {
  matcher: [
    "/home/cart",
    "/home/shipping",
    "/home/payment",
    "/home/orders",
    "/home/order_confirmation/:path",
    "/home/account",
  ],
};
