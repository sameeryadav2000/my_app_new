import type { NextConfig } from "next";

export default function defineConfig(): NextConfig {
  return {
    reactStrictMode: true,

    // eslint: {
    //   ignoreDuringBuilds: true,
    // },

    async redirects() {
      return [
        {
          source: "/",
          destination: "/home",
          permanent: true,
        },
      ];
    },
  };
}
