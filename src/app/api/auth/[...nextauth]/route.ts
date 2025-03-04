// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, Session, User, Account } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { JWT } from "next-auth/jwt";
import prisma from "../../../../../lib/prisma";

export interface ExtendedSession extends Session {
  accessToken?: string;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    emailVerified: boolean;
    phoneNumber: string | null;
    avatar: string | null;
    isActive: boolean;
    name?: string | null;
    image?: string | null;
  };
}

interface TokenSet {
  id_token?: string;
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  error?: string;
}

interface ExtendedJWT extends JWT {
  expiresAt?: number;
  refreshToken?: string;
}

interface ExtendedUser extends User {
  emailVerified?: Date | boolean | null;
}

function requestRefreshOfAccessToken(token: ExtendedJWT) {
  if (!token.refreshToken) {
    throw new Error("Refresh token is missing");
  }

  return fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken || "",
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

  callbacks: {
    async signIn({
      user,
      account,
    }: {
      user: ExtendedUser;
      account: Account | null;
    }) {
      if (!account?.providerAccountId) {
        console.log("No provider account ID found, skipping user creation");
        return true;
      }

      if (!user.email) {
        console.error("User missing email, cannot create database record");
        return false;
      }

      const externalId = account.providerAccountId.toString();

      const isEmailVerified: boolean = user.emailVerified
        ? typeof user.emailVerified === "boolean"
          ? user.emailVerified
          : true
        : false;

      const nameParts = user.name ? user.name.split(" ") : [];
      const firstName = nameParts[0] || null;
      const lastName =
        nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

      const existingUser = await prisma.user.findUnique({
        where: { externalId },
      });
      const isCreated = !existingUser;

      try {
        const updatedUser = await prisma.user.upsert({
          where: {
            externalId,
          },
          create: {
            externalId,
            email: user.email,
            firstName,
            lastName,
            emailVerified: isEmailVerified,
            lastLoginAt: new Date(),
          },
          update: {
            lastLoginAt: new Date(),
            email: user.email,
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
          },
        });

        console.log(
          `User ${updatedUser.id} successfully ${
            isCreated ? "created" : "updated"
          }`
        );
        return true;
      } catch (error) {
        console.error(
          "Error saving user:",
          error instanceof Error ? error.message : error
        );
        return false;
      }
    },

    async jwt({
      token,
      account,
    }: {
      token: ExtendedJWT;
      account: Account | null;
    }) {
      if (account) {
        token.idToken = account.id_token;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        return token;
      }

      if (
        token.expiresAt !== undefined &&
        Date.now() < token.expiresAt * 1000 - 60 * 1000
      ) {
        return token;
      } else {
        try {
          const response = await requestRefreshOfAccessToken(token);

          const tokens: TokenSet = await response.json();

          if (!response.ok) throw tokens;

          const updatedToken: ExtendedJWT = {
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

    async session(params) {
      const { session, token } = params;

      // Create a new session object that matches your ExtendedSession interface
      const extendedSession: ExtendedSession = {
        ...session,
        accessToken: token.accessToken as string | undefined,
        user: session.user
          ? {
              ...session.user,
              // Initialize with default values that will be overwritten if user exists in DB
              id: "",
              firstName: null,
              lastName: null,
              email: session.user.email || null,
              emailVerified: false,
              phoneNumber: null,
              avatar: null,
              isActive: false,
            }
          : undefined,
      };

      try {
        if (extendedSession.user?.email) {
          const user = await prisma.user.findUnique({
            where: { email: extendedSession.user.email },
            select: {
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
            extendedSession.user = {
              ...extendedSession.user,
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              emailVerified: user.emailVerified,
              phoneNumber: user.phoneNumber,
              avatar: user.avatar,
              isActive: user.isActive,
            };
          }
        }

        return extendedSession;
      } catch (error) {
        console.error("Error in session callback:", error);
        return extendedSession;
      }
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  pages: {
    signIn: "/login_signup",
    signOut: "/auth/signout",
  },
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
