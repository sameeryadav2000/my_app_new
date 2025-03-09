// src/app/api/shipping/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "../../../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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

    return NextResponse.json(
      {
        message: "Shipping information saved",
        shippingInfo: savedShipping,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error posting cart item:", error);

    return NextResponse.json(
      { message: "Failed to save shipping information" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch shipping info from the database (adjust based on your schema)
    const shippingInfo = await prisma.shippingInfo.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      shippingInfo: shippingInfo || null,
    });
  } catch (error) {
    console.error("Error fetching shipping info:", error);
    return NextResponse.json(
      { message: "Failed to fetch shipping info" },
      { status: 500 }
    );
  }
}
