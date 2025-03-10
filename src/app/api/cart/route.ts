// src/app/api/cart/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "../../../../lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the current path/URL to determine if we're on the orders page
    const url = new URL(req.url);
    const isOrdersPage = url.searchParams.get("page") === "orders";

    // Choose the appropriate status based on the page
    const cartStatus = isOrdersPage ? "PURCHASED" : "IN_CART";

    // Find the user based on email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        cartItems: {
          where: {
            status: cartStatus,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format the response to match your Cart interface
    const cart = {
      items: user.cartItems.map((item) => ({
        id: item.itemId,
        title: item.title,
        condition: item.condition,
        orderId: item.orderId,
        storage: item.storage,
        color: item.color,
        price: parseFloat(item.price.toString()),
        quantity: item.quantity,
        image: item.image,
      })),
      totalItems: user.cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subTotalPrice: user.cartItems.reduce(
        (sum, item) => sum + parseFloat(item.price.toString()) * item.quantity,
        0
      ),
    };

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Error fetching cart:", error);

    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    const isFullCart = body.cart && Array.isArray(body.cart.items);
    const cartItems = isFullCart ? body.cart.items : [body.cartItem];

    if (!cartItems.length) {
      return NextResponse.json(
        { error: "No cart items provided" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Process each cart item
    for (const item of cartItems) {
      // Validate item
      if (!item.id || !item.title || !item.price) {
        console.warn(`Skipping invalid cart item: ${JSON.stringify(item)}`);
        continue;
      }

      // Check if item already exists
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId: user.id,
          itemId: item.id,
          condition: item.condition,
          storage: item.storage,
          color: item.color,
          status: "IN_CART",
        },
      });

      if (existingItem) {
        // Update existing item
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: isFullCart
              ? existingItem.quantity + item.quantity
              : existingItem.quantity + 1,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new item
        await prisma.cartItem.create({
          data: {
            userId: user.id,
            itemId: item.id,
            title: item.title,
            condition: item.condition || "",
            storage: item.storage || "",
            color: item.color || "",
            price: item.price,
            quantity: isFullCart ? item.quantity : 1,
            image: item.image || "",
            status: "IN_CART",
          },
        });
      }
    }

    // Get the updated cart
    const userCart = await prisma.cartItem.findMany({
      where: {
        userId: user.id,
        status: "IN_CART",
      },
    });

    const cartTotal = {
      items: userCart.map((item) => ({
        id: item.itemId,
        title: item.title,
        condition: item.condition,
        storage: item.storage,
        color: item.color,
        price: parseFloat(item.price.toString()),
        quantity: item.quantity,
        image: item.image,
      })),
      totalItems: userCart.reduce((sum, item) => sum + item.quantity, 0),
      subTotalPrice: userCart.reduce(
        (sum, item) => sum + parseFloat(item.price.toString()) * item.quantity,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      cart: cartTotal,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const searchParams = req.nextUrl.searchParams;
    const iphoneModelId = searchParams.get("id");

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Find the user based on email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!iphoneModelId) {
      return NextResponse.json(
        { error: "iPhone model ID is required" },
        { status: 400 }
      );
    }

    // Delete all existing cart items for this user
    await prisma.cartItem.deleteMany({
      where: {
        userId: user.id,
        itemId: iphoneModelId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}

// Function to handle PATCH requests for updating cart item status to PURCHASED
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Find the user based on email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const requestBody = await req.json();
    const orderNumber = requestBody.orderNumber;

    // Update all cart items for this user with IN_CART status
    const updateResult = await prisma.cartItem.updateMany({
      where: {
        userId: user.id,
        status: "IN_CART",
      },
      data: {
        status: "PURCHASED",
        orderId: orderNumber,
      },
    });

    return NextResponse.json({
      success: true,
      updatedItems: updateResult.count,
      orderId: orderNumber,
    });
  } catch (error) {
    console.error("Error updating cart item status:", error);
    return NextResponse.json(
      { error: "Failed to update cart item status" },
      { status: 500 }
    );
  }
}
