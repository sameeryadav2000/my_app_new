import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import prisma from "../../../../lib/prisma";

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

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email || undefined,
      },
      include: {
        purchasedItems: true,
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

    const purchasesByOrder = user.purchasedItems.reduce((orders, item) => {
      if (!orders[item.orderId]) {
        orders[item.orderId] = {
          orderId: item.orderId,
          items: [],
          totalItems: 0,
          totalPrice: 0,
          createdAt: item.createdAt,
        };
      }

      orders[item.orderId].items.push({
        id: item.id,
        itemId: item.itemId,
        title: item.title,
        condition: item.condition,
        storage: item.storage,
        color: item.color,
        price: parseFloat(item.price.toString()),
        quantity: item.quantity,
        image: item.image,
      });

      orders[item.orderId].totalItems += item.quantity;
      orders[item.orderId].totalPrice += parseFloat(item.price.toString()) * item.quantity;

      return orders;
    }, {} as Record<string, any>);

    // Convert to array and sort by createdAt date (newest first)
    const purchases = Object.values(purchasesByOrder).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: {
        purchases,
        totalOrders: purchases.length,
        totalSpent: purchases.reduce((sum, order) => sum + order.totalPrice, 0),
      },
    });
  } catch (error) {
    console.error("Error fetching purchased items:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch purchase history",
      },
      { status: 500 }
    );
  }
}
