import type { NextConfig } from "next";

export default function defineConfig(): NextConfig {
  return {
    reactStrictMode: true,

    async redirects() {
      return [
        {
          source: "/",
          destination: "/homepage",
          permanent: true,
        },
      ];
    },
  };
}
