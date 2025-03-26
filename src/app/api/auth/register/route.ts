// app/api/auth/register/route.js
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, password, confirmPassword } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Validate password match if confirmPassword is provided
    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match",
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

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long",
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

    // Step 2: Create the user
    const createUserUrl = `${keycloakUrl}/admin/realms/${realm}/users`;

    const userData = {
      username: email.toLowerCase(),
      email: email.toLowerCase(),
      firstName: firstName,
      lastName: lastName,
      enabled: true,
      emailVerified: false,
      credentials: [
        {
          type: "password",
          value: password,
          temporary: false,
        },
      ],
      requiredActions: ["VERIFY_EMAIL"],
    };

    const createUserResponse = await fetch(createUserUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(userData),
    });

    // Handle error cases
    if (!createUserResponse.ok) {
      const createUserText = await createUserResponse.text();
      console.error("Failed to create user. Status:", createUserResponse.status);
      console.error("Response:", createUserText);

      if (createUserResponse.status === 409) {
        return NextResponse.json(
          {
            success: false,
            message: "A user with this email already exists",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `Failed to create user: ${createUserText}`,
        },
        { status: createUserResponse.status }
      );
    }

    // Step 3: Get the user ID for the newly created user
    const getUsersUrl = `${keycloakUrl}/admin/realms/${realm}/users?email=${encodeURIComponent(email.toLowerCase())}`;
    const getUsersResponse = await fetch(getUsersUrl, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!getUsersResponse.ok) {
      console.error("Failed to retrieve user");
      return NextResponse.json(
        {
          success: true,
          message: "User created but failed to send verification email",
        },
        { status: 201 }
      );
    }

    const users = await getUsersResponse.json();
    if (!users || users.length === 0) {
      console.error("User not found after creation");
      return NextResponse.json(
        {
          success: true,
          message: "User created but not found",
        },
        { status: 201 }
      );
    }

    const userId = users[0].id;

    // Step 4: Send the verification email using the dedicated endpoint
    const sendVerifyEmailUrl = `${keycloakUrl}/admin/realms/${realm}/users/${userId}/send-verify-email`;
    const executeActionResponse = await fetch(sendVerifyEmailUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!executeActionResponse.ok) {
      const executeActionError = await executeActionResponse.text();
      console.error("Failed to send verification email:", executeActionError);
      return NextResponse.json(
        {
          success: true,
          message: "User registered successfully, but verification email could not be sent",
        },
        { status: 201 }
      );
    }

    console.log("User created successfully and verification email sent");
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error instanceof Error ? error.message : "Unknown error");
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace available");

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred during registration",
      },
      { status: 500 }
    );
  }
}
