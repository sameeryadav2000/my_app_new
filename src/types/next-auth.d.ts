// types/next-auth.d.ts

import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      emailVerified: boolean;
      phoneNumber?: string | null;
      avatar?: string | null;
      isActive: boolean;
    } & DefaultSession["user"];
  }
}
