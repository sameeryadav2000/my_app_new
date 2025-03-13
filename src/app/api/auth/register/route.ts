// // app/api/auth/register/route.js
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { email, firstName, lastName, password } = body;

//     if (!email || !firstName || !lastName || !password) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     const keycloakUrl = process.env.KEYCLOAK_DIRECT_URL;
//     const realm = process.env.KEYCLOAK_DIRECT_REALM;
//     const adminUsername = process.env.KEYCLOAK_ADMIN_USERNAME;
//     const adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD;

//     if (!keycloakUrl || !realm || !adminUsername || !adminPassword) {
//       console.error("Missing Keycloak admin configuration");
//       return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
//     }

//     const tokenUrl = `${keycloakUrl}/realms/master/protocol/openid-connect/token`;
//     const tokenResponse = await fetch(tokenUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body: new URLSearchParams({
//         grant_type: "password",
//         client_id: "admin-cli",
//         username: adminUsername,
//         password: adminPassword,
//       }),
//     });

//     if (!tokenResponse.ok) {
//       const tokenError = await tokenResponse.text();
//       console.error("Admin authentication failed:", tokenError);
//       return NextResponse.json({ error: "Server authentication error" }, { status: 500 });
//     }

//     const tokenData = await tokenResponse.json();
//     const adminToken = tokenData.access_token;

//     const createUserUrl = `${keycloakUrl}/admin/realms/${realm}/users`;

//     const userData = {
//       username: email.toLowerCase(),
//       email: email.toLowerCase(),
//       firstName: firstName,
//       lastName: lastName,
//       enabled: true,
//       emailVerified: false,
//       credentials: [
//         {
//           type: "password",
//           value: password,
//           temporary: false,
//         },
//       ],
//       requiredActions: ["VERIFY_EMAIL"],
//     };

//     const createUserResponse = await fetch(createUserUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${adminToken}`,
//       },
//       body: JSON.stringify(userData),
//     });

//     const createUserText = await createUserResponse.text();

//     if (!createUserResponse.ok) {
//       console.error("Failed to create user. Status:", createUserResponse.status);
//       console.error("Response:", createUserText);

//       if (createUserResponse.status === 409) {
//         return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
//       }

//       return NextResponse.json({ error: `Failed to create user: ${createUserText}` }, { status: createUserResponse.status });
//     }

//     console.log("User created successfully with credentials");

//     return NextResponse.json({ success: true, message: "User registered successfully" }, { status: 201 });
//   } catch (error) {
//     console.error("Registration error:", error.message);
//     console.error("Stack trace:", error.stack);
//     return NextResponse.json({ error: `An unexpected error occurred: ${error.message}` }, { status: 500 });
//   }
// }

// app/api/auth/register/route.js
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, password } = body;

    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const keycloakUrl = process.env.KEYCLOAK_DIRECT_URL;
    const realm = process.env.KEYCLOAK_DIRECT_REALM;
    const adminUsername = process.env.KEYCLOAK_ADMIN_USERNAME;
    const adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD;

    if (!keycloakUrl || !realm || !adminUsername || !adminPassword) {
      console.error("Missing Keycloak admin configuration");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
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
      return NextResponse.json({ error: "Server authentication error" }, { status: 500 });
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
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
      }

      return NextResponse.json({ error: `Failed to create user: ${createUserText}` }, { status: createUserResponse.status });
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
      return NextResponse.json({ error: "User created but failed to send verification email" }, { status: 500 });
    }

    const users = await getUsersResponse.json();
    if (!users || users.length === 0) {
      console.error("User not found after creation");
      return NextResponse.json({ error: "User created but not found" }, { status: 500 });
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const stackTrace = error instanceof Error ? error.stack : "No stack trace available";

    console.error("Registration error:", errorMessage);
    console.error("Stack trace:", stackTrace);

    return NextResponse.json({ error: `An unexpected error occurred: ${errorMessage}` }, { status: 500 });
  }
}
