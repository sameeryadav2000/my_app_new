// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. Get the token from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // 2. Return error if token is missing
    if (!token) {
      return NextResponse.redirect(new URL("/login_signup/verification_error?error=missing-token", request.url));
    }

    // 3. Find the verification token in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true }, // Include the associated user
    });

    // 4. Check if token exists
    if (!verificationToken) {
      return NextResponse.redirect(new URL("/login_signup/verification_error?error=invalid-token", request.url));
    }

    // 5. Check if token is expired
    if (verificationToken.expires < new Date()) {
      return NextResponse.redirect(new URL("/login_signup/verification_error?error=expired-token", request.url));
    }

    // 6. Get the user from the token
    const user = verificationToken.user;

    // 7. Check if user exists
    if (!user) {
      return NextResponse.redirect(new URL("api/auth/verification_error?error=user-not-found", request.url));
    }

    // 8. Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.redirect(new URL("/login_signup/already_verified", request.url));
    }

    // 9. Update user's verification status
    await prisma.user.update({
      where: { id: user.id }, // Use user.id instead of userId
      data: { emailVerified: true },
    });

    // 10. Delete the verification token (cleanup)
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    // 11. Redirect to verification success page
    return NextResponse.redirect(new URL("/login_signup/verification_success", request.url));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL("/login_signup/verification_error?error=server-error", request.url));
  }
}
