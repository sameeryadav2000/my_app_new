// src/app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia", // Use the latest version
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, metadata } = body;

    // Manual validation
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Must be a positive number." },
        { status: 400 }
      );
    }

    if (metadata) {
      if (!metadata.orderId) {
        return NextResponse.json(
          { error: "Missing orderId in metadata" },
          { status: 400 }
        );
      }

      // Optional validation for email format
      if (metadata.customerEmail && !isValidEmail(metadata.customerEmail)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: "usd",
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
      statement_descriptor_suffix: "YourStore Order",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    // Enhanced error handling
    console.error("Error creating payment intent:", error);

    // Check if it's a Stripe error
    if (
      error?.type &&
      typeof error.type === "string" &&
      error.type.startsWith("Stripe")
    ) {
      return NextResponse.json(
        {
          error: "Payment service error",
          message: error.message || "Unknown payment error",
          code: error.code || "unknown",
        },
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { error: "Failed to process payment request" },
      { status: 500 }
    );
  }
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
