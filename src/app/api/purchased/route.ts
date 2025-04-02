import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextResponse) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json(
      {
        success: false,
        message: "Order ID is required",
      },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        purchasedItems: {
          where: {
            orderId: orderId,
          },
          include: {
            phoneModels: true,
            color: true,
            seller: true,
          },
        },
      },
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

    if (user.purchasedItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Calculate order totals
    const totalItems = user.purchasedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = user.purchasedItems.reduce((sum, item) => sum + parseFloat(item.price.toString()) * item.quantity, 0);

    // Format the order details
    const orderDetails = {
      orderId: orderId,
      items: user.purchasedItems.map((item) => ({
        id: item.id,
        titleName: item.phoneModels.model,
        colorName: item.color.color,
        condition: item.condition,
        storage: item.storage,
        price: parseFloat(item.price.toString()),
        quantity: item.quantity,
        image: item.image,
        seller: item.seller.name,
      })),
      totalItems,
      totalPrice,
      createdAt: user.purchasedItems[0].createdAt,
    };

    return NextResponse.json({
      success: true,
      order: orderDetails,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch order details",
      },
      { status: 500 }
    );
  }
}
