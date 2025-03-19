// src/app/api/shipping/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "../../../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const shippingInfo = await prisma.shippingInfo.findUnique({
      where: { userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
      },
    });

    return NextResponse.json({
      success: true,
      shippingInfo: shippingInfo,
    });
  } catch (error) {
    console.error("Error fetching shipping info:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch shipping info",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email || undefined },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found in database",
        },
        { status: 404 }
      );
    }

    const shippingData = await request.json();

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
        success: true,
        message: "Shipping information saved",
        shippingInfo: savedShipping,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving shipping info:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to save shipping information",
      },
      { status: 500 }
    );
  }
}
