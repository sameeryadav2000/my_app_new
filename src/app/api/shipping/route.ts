// src/app/api/shipping/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "../../../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the shipping data from request
    const shippingData = await request.json();

    // First, ensure the user exists in the database
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.shippingInfo.findFirst({
      where: { userId: session.user.id },
    });

    let savedShipping;

    if (existingItem) {
      // Update quantity if item exists
      savedShipping = await prisma.shippingInfo.update({
        where: { userId: session.user.id },
        data: {
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          email: shippingData.email,
          phone: shippingData.phone,
          address: shippingData.address,
          city: shippingData.city,
          state: shippingData.state,
          zipCode: shippingData.zipCode,
        },
      });
    } else {
      // Create new cart item if it doesn't exist
      savedShipping = await prisma.shippingInfo.create({
        data: {
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          email: shippingData.email,
          phone: shippingData.phone,
          address: shippingData.address,
          city: shippingData.city,
          state: shippingData.state,
          zipCode: shippingData.zipCode,
          userId: session.user.id,
        },
      });
    }

    // Send success response
    return NextResponse.json(
      {
        message: "Shipping information saved",
        data: savedShipping,
      },
      { status: 201 }
    );
  } catch (error) {
    let errorMessage = "Failed to delete item";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Error posting cart item:", error.message);
    } else {
      console.error("Error posting cart item:", String(error));
    }

    // Send error response
    return NextResponse.json(
      {
        message: "Failed to save shipping information",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get the session from the server
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch shipping info from the database (adjust based on your schema)
    const shippingInfo = await prisma.shippingInfo.findUnique({
      where: { userId },
    });

    if (!shippingInfo) {
      return NextResponse.json(
        { message: "No shipping information found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shippingInfo, { status: 200 });
  } catch (error) {
    console.error("Error fetching shipping info:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
