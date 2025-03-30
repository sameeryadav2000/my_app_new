// src/app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, metadata } = body;

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid amount. Must be a positive number.",
        },
        { status: 400 }
      );
    }

    if (metadata) {
      if (!metadata.orderId) {
        return NextResponse.json(
          {
            success: false,
            message: "Missing orderId in metadata",
          },
          { status: 400 }
        );
      }

      if (metadata.customerEmail && !isValidEmail(metadata.customerEmail)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid email format",
          },
          { status: 400 }
        );
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
      statement_descriptor_suffix: "YourStore Order",
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating payment intent:", error);

    if (error?.type && typeof error.type === "string" && error.type.startsWith("Stripe")) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment service error",
          message: error.message || "Unknown payment error",
          code: error.code || "unknown",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to process payment request",
      },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
