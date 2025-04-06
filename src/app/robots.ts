// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/home/cart", "/home/shipping", "/home/payment", "/home/order_confirmation", "/home/orders", "/home/account"],
    },
    sitemap: "https://mobileloom.com/sitemap.xml",
  };
}
