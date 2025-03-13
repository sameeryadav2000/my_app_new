// src/app/api/auth/federated-logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { JWT } from "next-auth/jwt";

function logoutParams(token: JWT): Record<string, string> {
  if (!process.env.NEXTAUTH_URL) {
    throw new Error("NEXTAUTH_URL is not defined");
  }

  if (!token.idToken) {
    throw new Error("ID token is missing from the authentication session");
  }

  const baseUrl = process.env.NEXTAUTH_URL.replace(/\/$/, "");
  const redirectPath = process.env.LOGOUT_REDIRECT_PATH || "/";
  const fullRedirectUrl = redirectPath.startsWith("http")
    ? redirectPath
    : `${baseUrl}${redirectPath.startsWith("/") ? "" : "/"}${redirectPath}`;

  return {
    id_token_hint: token.idToken,
    post_logout_redirect_uri: fullRedirectUrl,
  };
}

function handleEmptyToken() {
  return NextResponse.json(
    {
      success: false,
      error: "No session present",
    },
    {
      status: 400,
    }
  );
}

function sendEndSessionEndpointToURL(token: JWT) {
  const isGoogle = token.provider === "keycloak-google";

  const issuer = isGoogle ? process.env.KEYCLOAK_GOOGLE_ISSUER : process.env.KEYCLOAK_DIRECT_ISSUER;

  const endSessionEndPoint = new URL(`${issuer}/protocol/openid-connect/logout`);
  const params: Record<string, string> = logoutParams(token);
  const endSessionParams = new URLSearchParams(params);
  const logoutUrl = `${endSessionEndPoint.href}?${endSessionParams}`;

  return NextResponse.json({
    success: true,
    url: logoutUrl,
  });
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (token) {
      return sendEndSessionEndpointToURL(token);
    }

    return handleEmptyToken();
  } catch (error) {
    console.error("Federated logout error:", error);

    const errorMessage = error instanceof Error ? `Logout failed: ${error.message}` : "Unable to logout from the session";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}
