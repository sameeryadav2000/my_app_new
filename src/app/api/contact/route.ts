// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { sendEmail } from "../../../../lib/send_grid";

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

    // Add this near the top of your route handler to check credentials
    console.log("Using API key starting with:", process.env.SENDGRID_API_KEY?.substring(0, 5) + "...");
    console.log("Using sender email:", process.env.EMAIL_FROM);

    // Send notification email to admin
    const adminEmailResult = await sendEmail({
      to: process.env.ADMIN_EMAIL || "your-email@example.com",
      from: process.env.EMAIL_FROM || "noreply@mobozen.com",
      subject: "New Contact Form Submission - MoboZen",
      text: `
            New message from: ${email}
            Phone: ${phone}
            
            Message:
            ${message}
          `,
      html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, "<br>")}</p>
          `,
    });

    // Send confirmation email to user
    const userEmailResult = await sendEmail({
      to: email,
      from: process.env.EMAIL_FROM || "noreply@mobozen.com", // Use your verified sender
      subject: "Thank you for contacting MoboZen",
      text: `
        Dear Customer,
        
        Thank you for contacting MoboZen. We have received your message and will get back to you as soon as possible.
        
        Your message:
        ${message}
        
        Best Regards,
        The MoboZen Team
        `,
      html: `
        <h2>Thank you for contacting MoboZen</h2>
        <p>Dear Customer,</p>
        <p>Thank you for contacting MoboZen. We have received your message and will get back to you as soon as possible.</p>
        <h3>Your message:</h3>
        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${message.replace(/\n/g, "<br>")}</p>
        <p>Best Regards,<br>The MoboZen Team</p>
        `,
    });

    // Check if there was an error sending either email
    if (!adminEmailResult.success || !userEmailResult.success) {
      console.error("Email sending failed:", {
        adminError: adminEmailResult.message,
        userError: userEmailResult.message,
      });

      // Note: We still return success since the data was saved to the database
      return NextResponse.json(
        {
          success: true,
          message: "Your message has been submitted successfully, but there was an issue sending confirmation emails.",
          data: {
            id: contactMessage.id,
            email: contactMessage.email,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been submitted successfully. We'll get back to you soon!",
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
