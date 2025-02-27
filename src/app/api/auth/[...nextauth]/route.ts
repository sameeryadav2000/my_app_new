// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, DefaultSession } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { JWT } from "next-auth/jwt";
import prisma from "../../../../../lib/prisma";

// // Extend the default session type
// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     accessToken?: string;
//   }
// }

// Extend the default JWT type
declare module "next-auth/jwt" {
  interface JWT {
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}

// Define the TokenSet interface for refresh token response
interface TokenSet {
  id_token?: string;
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  error?: string;
}

function requestRefreshOfAccessToken(token: JWT) {
  return fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken!,
    }),
    method: "POST",
    cache: "no-store",
  });
}

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  pages: {
    signIn: "/login_signup",
    signOut: "/auth/signout",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.providerAccountId) return true; // Check for sub

      const externalId = account.providerAccountId.toString(); // Convert to string explicitly

      const isEmailVerified =
        typeof (user as any).emailVerified === "boolean"
          ? (user as any).emailVerified
          : false;

      //   console.log(user, account);

      try {
        await prisma.user.upsert({
          where: {
            externalId: externalId, // Now definitely a string
          },
          create: {
            externalId: externalId, // Now definitely a string
            email: user.email!,
            firstName: user.name?.split(" ")[0] ?? null,
            lastName: user.name?.split(" ")[1] ?? null,
            emailVerified: isEmailVerified,
            lastLoginAt: new Date(),
          },
          update: {
            lastLoginAt: new Date(),
            email: user.email!,
          },
        });
        return true;
      } catch (error) {
        console.error("Error saving user:", error);
        return false;
      }
    },

    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        return token;
      }
      if (Date.now() < token.expiresAt! * 1000 - 60 * 1000) {
        return token;
      } else {
        try {
          const response = await requestRefreshOfAccessToken(token);

          const tokens: TokenSet = await response.json();

          if (!response.ok) throw tokens;

          const updatedToken: JWT = {
            ...token, // Keep the previous token properties
            idToken: tokens.id_token,
            accessToken: tokens.access_token,
            expiresAt: Math.floor(
              Date.now() / 1000 + (tokens.expires_in as number)
            ),
            refreshToken: tokens.refresh_token ?? token.refreshToken,
          };
          return updatedToken;
        } catch (error) {
          console.error("Error refreshing access token", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }
    },
    // src/app/api/auth/[...nextauth]/route.ts

    async session({ session, token }) {
      // Add access token to session
      session.accessToken = token.accessToken;

      try {
        // Fetch the user from our database using email
        const user = await prisma.user.findUnique({
          where: {
            email: session.user?.email!,
          },
          select: {
            // Only select the fields we need
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            emailVerified: true,
            phoneNumber: true,
            avatar: true,
            isActive: true,
          },
        });

        if (user) {
          // Enhance the session user object with our database fields
          session.user = {
            ...session.user,
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            isActive: user.isActive,
          };
        }

        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session; // Return original session if there's an error
      }
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
