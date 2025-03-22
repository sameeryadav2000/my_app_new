// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, User, Account, DefaultSession } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { JWT } from "next-auth/jwt";
import prisma from "../../../../../lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      emailVerified: boolean;
      phoneNumber: string | null;
      avatar: string | null;
      isActive: boolean;
      admin: boolean;
    } & DefaultSession["user"];
  }
}

interface TokenSet {
  id_token?: string;
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  error?: string;
}

declare module "next-auth/jwt" {
  interface JWT {
    expiresAt?: number;
    refreshToken?: string;
    idToken?: string;
    provider?: string;
    error?: string;
  }
}

interface ExtendedUser extends User {
  emailVerified?: Date | boolean | null;
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  providerAccountId?: string;
  admin?: boolean;
}

function requestRefreshOfAccessToken(token: JWT) {
  if (!token.refreshToken) {
    throw new Error("Refresh token is missing");
  }
  // Check if the provider is defined
  if (!token.provider) {
    throw new Error("Provider information missing in token");
  }

  const isGoogle = token.provider === "keycloak-google";

  const issuer = isGoogle ? process.env.KEYCLOAK_GOOGLE_ISSUER : process.env.KEYCLOAK_DIRECT_ISSUER;

  const clientId = isGoogle ? process.env.KEYCLOAK_GOOGLE_ID : process.env.KEYCLOAK_DIRECT_ID;

  const clientSecret = isGoogle ? process.env.KEYCLOAK_GOOGLE_SECRET : process.env.KEYCLOAK_DIRECT_SECRET;

  // Validate required environment variables
  if (!issuer) {
    throw new Error(`Missing environment variable: ${isGoogle ? "KEYCLOAK_GOOGLE_ISSUER" : "KEYCLOAK_DIRECT_ISSUER"}`);
  }

  if (!clientId) {
    throw new Error(`Missing environment variable: ${isGoogle ? "KEYCLOAK_GOOGLE_ID" : "KEYCLOAK_DIRECT_ID"}`);
  }

  if (!clientSecret) {
    throw new Error(`Missing environment variable: ${isGoogle ? "KEYCLOAK_GOOGLE_SECRET" : "KEYCLOAK_DIRECT_SECRET"}`);
  }

  return fetch(`${issuer}/protocol/openid-connect/token`, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
    method: "POST",
    cache: "no-store",
  });
}

export const authOptions: AuthOptions = {
  providers: [
    // Keycloak provider for Google Sign-In (using Google as identity provider)
    KeycloakProvider({
      id: "keycloak-google",
      name: "Keycloak (Google)",
      clientId:
        process.env.KEYCLOAK_GOOGLE_ID ??
        (() => {
          throw new Error("KEYCLOAK_GOOGLE_ID is not set");
        })(),
      clientSecret:
        process.env.KEYCLOAK_GOOGLE_SECRET ??
        (() => {
          throw new Error("KEYCLOAK_GOOGLE_SECRET is not set");
        })(),
      issuer: process.env.KEYCLOAK_GOOGLE_ISSUER,
    }),

    CredentialsProvider({
      id: "keycloak-direct",
      name: "Keycloak (Direct)",
      credentials: {
        username: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const clientId = process.env.KEYCLOAK_DIRECT_ID;
        const clientSecret = process.env.KEYCLOAK_DIRECT_SECRET;

        if (!clientId || !clientSecret) {
          throw new Error("Keycloak client ID or secret is not configured");
        }

        if (!credentials || !credentials.username || !credentials.password) {
          throw new Error("Missing username or password");
        }

        const tokenResponse = await fetch("http://localhost:8080/realms/key_cloak/protocol/openid-connect/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "password",
            client_id: clientId,
            client_secret: clientSecret,
            username: credentials.username,
            password: credentials.password,
            scope: "openid profile email",
          }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
          throw new Error(tokenData.error_description || "Authentication failed");
        }

        const userInfoResponse = await fetch("http://localhost:8080/realms/key_cloak/protocol/openid-connect/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (!userInfoResponse.ok) {
          const errorText = await userInfoResponse.text();
          throw new Error(`Failed to fetch user info: ${userInfoResponse.status} - ${errorText}`);
        }

        const userInfo = await userInfoResponse.json();

        if (!userInfo.sub) {
          throw new Error("Unable to retrieve user ID (sub) from Keycloak userinfo");
        }

        const isAdmin = Array.isArray(userInfo.roles) && userInfo.roles.includes("app_admin");

        return {
          id: userInfo.sub,
          email: userInfo.email || credentials.username,
          name: userInfo.name || credentials.username,
          providerAccountId: userInfo.sub,
          emailVerified: userInfo.email_verified,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          idToken: tokenData.id_token || tokenData.access_token,
          expiresAt: Math.floor(Date.now() / 1000) + (tokenData.expires_in || 3600),
          admin: isAdmin,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }: { user: ExtendedUser; account: Account | null }) {
      if (!account?.providerAccountId) {
        console.log("No provider account ID found, skipping user creation");
        return true;
      }

      if (!user.email) {
        console.error("User missing email, cannot create database record");
        return false;
      }

      const externalId = account.providerAccountId.toString();

      const isEmailVerified: boolean = user.emailVerified ? (typeof user.emailVerified === "boolean" ? user.emailVerified : true) : false;

      const nameParts = user.name ? user.name.split(" ") : [];
      const firstName = nameParts[0] || null;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

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
            admin: user.admin,
            emailVerified: isEmailVerified,
            lastLoginAt: new Date(),
          },
          update: {
            lastLoginAt: new Date(),
            email: user.email,
            emailVerified: isEmailVerified,
            admin: user.admin,
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
          },
        });

        console.log(`User ${updatedUser.id} successfully ${isCreated ? "created" : "updated"}`);
        return true;
      } catch (error) {
        console.error("Error saving user:", error instanceof Error ? error.message : error);
        return false;
      }
    },

    async jwt({ token, user, account }: { token: JWT; user: ExtendedUser; account: Account | null }) {
      if (account && account.access_token) {
        token.idToken = account.id_token;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.provider = account.provider;
        return token;
      }

      if (user && user.accessToken && account) {
        token.idToken = user.idToken;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expiresAt = user.expiresAt;
        token.provider = account.provider;
        return token;
      }

      if (token.expiresAt !== undefined && Date.now() < token.expiresAt * 1000 - 60 * 1000) {
        return token;
      } else {
        try {
          const response = await requestRefreshOfAccessToken(token);

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Token refresh failed:", errorData);
            return {
              ...token,
              error: "RefreshAccessTokenError",
            };
          }

          const tokens: TokenSet = await response.json();

          if (!response.ok) throw tokens;

          const updatedToken: JWT = {
            ...token, // Keep the previous token properties
            idToken: tokens.id_token,
            accessToken: tokens.access_token,
            expiresAt: Math.floor(Date.now() / 1000 + (tokens.expires_in as number)),
            refreshToken: tokens.refresh_token ?? token.refreshToken,
          };
          return updatedToken;
        } catch (error) {
          console.error("Error refreshing access token", error);
          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        }
      }
    },

    async session(params) {
      const { session, token } = params;

      session.accessToken = token.accessToken as string | undefined;

      if (token.error) {
        session.error = token.error;
      }

      if (session.user) {
        session.user.id = "";
        session.user.firstName = null;
        session.user.lastName = null;
        session.user.emailVerified = false;
        session.user.phoneNumber = null;
        session.user.avatar = null;
        session.user.isActive = false;
      }

      try {
        if (session.user?.email) {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              emailVerified: true,
              admin: true,
              phoneNumber: true,
              avatar: true,
              isActive: true,
            },
          });

          if (user && session.user) {
            session.user.id = user.id;
            session.user.firstName = user.firstName;
            session.user.lastName = user.lastName;
            session.user.emailVerified = user.emailVerified;
            session.user.admin = user.admin;
            session.user.phoneNumber = user.phoneNumber;
            session.user.avatar = user.avatar;
            session.user.isActive = user.isActive;
          }
        }

        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
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
