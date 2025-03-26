// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Get Keycloak configuration
    const keycloakUrl = process.env.KEYCLOAK_DIRECT_URL;
    const realm = process.env.KEYCLOAK_DIRECT_REALM;
    const adminUsername = process.env.KEYCLOAK_ADMIN_USERNAME;
    const adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD;

    if (!keycloakUrl || !realm || !adminUsername || !adminPassword) {
      console.error("Missing Keycloak admin configuration");
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error",
        },
        { status: 500 }
      );
    }

    // Step 1: Get admin token
    const tokenUrl = `${keycloakUrl}/realms/master/protocol/openid-connect/token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "password",
        client_id: "admin-cli",
        username: adminUsername,
        password: adminPassword,
      }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error("Admin authentication failed:", tokenError);
      return NextResponse.json(
        {
          success: false,
          message: "Server authentication error",
        },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const adminToken = tokenData.access_token;

    // Step 2: Find the user by email
    const getUsersUrl = `${keycloakUrl}/admin/realms/${realm}/users?email=${encodeURIComponent(email.toLowerCase())}`;
    const getUsersResponse = await fetch(getUsersUrl, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!getUsersResponse.ok) {
      console.error("Failed to search for user by email");
      return NextResponse.json(
        {
          success: false,
          message: "Failed to process request",
        },
        { status: getUsersResponse.status }
      );
    }

    const users = await getUsersResponse.json();

    // For security, don't reveal if user exists or not
    if (!users || users.length === 0) {
      console.log("No user found with this email, but returning success for security");
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with this email, password reset instructions will be sent",
        },
        { status: 200 }
      );
    }

    const userId = users[0].id;

    // Step 3: Use execute-actions-email endpoint with UPDATE_PASSWORD action
    const actionsEmailUrl = `${keycloakUrl}/admin/realms/${realm}/users/${userId}/execute-actions-email`;

    const actionsEmailResponse = await fetch(actionsEmailUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(["UPDATE_PASSWORD"]),
    });

    if (!actionsEmailResponse.ok) {
      const actionsError = await actionsEmailResponse.text();
      console.error("Failed to trigger password reset actions:", actionsError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send reset password email",
        },
        { status: actionsEmailResponse.status }
      );
    }

    console.log("Password reset email sent successfully");
    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with this email, password reset instructions will be sent",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error instanceof Error ? error.message : "Unknown error");
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace available");

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
