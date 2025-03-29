// app/api/auth/reset_password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Validate required fields
    if (!token || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Token and password are required",
        },
        { status: 400 }
      );
    }

    // Validate password strength (adjust as needed)
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Find the password reset record
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        token: token,
        expiresAt: {
          gt: new Date() // Token must not be expired
        }
      },
      include: {
        user: true
      }
    });

    if (!passwordReset) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired reset token",
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await prisma.user.update({
      where: {
        id: passwordReset.userId
      },
      data: {
        passwordHash: hashedPassword
      }
    });

    // Delete the used token
    await prisma.passwordReset.delete({
      where: {
        id: passwordReset.id
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password has been reset successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error instanceof Error ? error.message : "Unknown error");
    
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}