// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, message } = body;

    // Validate required fields
    if (!email || !email.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required",
        },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is required",
        },
        { status: 400 }
      );
    }

    // Additional validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone must contain only numbers",
        },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Message must be at least 10 characters",
        },
        { status: 400 }
      );
    }

    // Save to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        email,
        phone,
        message,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been submitted successfully",
        data: {
          id: contactMessage.id,
          email: contactMessage.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting contact form:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to submit your message",
      },
      { status: 500 }
    );
  }
}
