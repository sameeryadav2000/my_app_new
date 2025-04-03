import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth_options";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

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
        purchasedItems: orderId
          ? {
              where: {
                orderId: orderId,
              },
              include: {
                phoneModels: true,
                color: true,
                seller: true,
              },
            }
          : {
              include: {
                phoneModels: true,
                color: true,
                seller: true,
              },
              orderBy: {
                createdAt: "desc",
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

    if (orderId && user.purchasedItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // If orderId is provided, return a single order
    if (orderId) {
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
        createdAt: user.purchasedItems[0]?.createdAt,
      };

      return NextResponse.json({
        success: true,
        order: orderDetails,
      });
    }
    // If no orderId is provided, return all purchases grouped by order
    else {
      // Group purchased items by orderId
      const orderMap = new Map();

      user.purchasedItems.forEach((item) => {
        if (!orderMap.has(item.orderId)) {
          orderMap.set(item.orderId, {
            items: [],
            totalItems: 0,
            totalPrice: 0,
            createdAt: item.createdAt,
          });
        }

        const order = orderMap.get(item.orderId);

        // Add item to order
        order.items.push({
          id: item.id,
          phoneModelDetailsId: item.phoneModelDetailsId,
          phoneModelId: item.phoneModelId,
          phoneModelName: item.phoneModels.model,
          colorId: item.colorId,
          colorName: item.color.color,
          condition: item.condition,
          storage: item.storage,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          sellerName: item.seller.name,
        });

        // Update order totals
        order.totalItems += item.quantity;
        order.totalPrice += parseFloat(item.price.toString()) * item.quantity;
      });

      // Convert map to array of orders
      const purchases = Array.from(orderMap.entries()).map(([orderId, orderData]) => ({
        orderId,
        ...orderData,
      }));

      return NextResponse.json({
        success: true,
        data: {
          purchases,
        },
      });
    }
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
