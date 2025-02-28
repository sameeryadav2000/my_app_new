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

    // Find the user based on email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        cartItems: {
          where: {
            status: "IN_CART",
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

    const { cartItem } = await req.json();

    // Validate required fields
    if (!cartItem || !cartItem.id || !cartItem.title || !cartItem.price) {
      return NextResponse.json(
        { error: "Missing required cart item fields" },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // Create user if they don't exist
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          // Add any other required user fields
        },
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        itemId: cartItem.id,
        condition: cartItem.condition,
        storage: cartItem.storage,
        color: cartItem.color,
        status: "IN_CART",
      },
    });

    let updatedItem;

    if (existingItem) {
      // Update quantity if item exists
      updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + 1,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new cart item if it doesn't exist
      updatedItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          itemId: cartItem.id,
          title: cartItem.title,
          condition: cartItem.condition,
          storage: cartItem.storage,
          color: cartItem.color,
          price: cartItem.price,
          quantity: 1,
          image: cartItem.image,
          status: "IN_CART",
        },
      });
    }

    // Return the updated cart total
    const userCart = await prisma.cartItem.findMany({
      where: {
        userId: user.id,
        status: "IN_CART", // Only include items that are still in the cart
      },
    });

    const cartTotal = {
      items: userCart,
      totalItems: userCart.reduce((sum, item) => sum + item.quantity, 0),
      subTotalPrice: userCart.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      cartItem: updatedItem,
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

    // Delete all existing cart items for this user
    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
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

    // Generate a unique orderId or use the provided orderNumber
    const orderId = uuidv4();

    // Update all cart items for this user with IN_CART status
    const updateResult = await prisma.cartItem.updateMany({
      where: {
        userId: user.id,
        status: "IN_CART",
      },
      data: {
        status: "PURCHASED",
        orderId: orderId,
      },
    });

    return NextResponse.json({
      success: true,
      updatedItems: updateResult.count,
      orderId: orderId,
    });
  } catch (error) {
    console.error("Error updating cart item status:", error);
    return NextResponse.json(
      { error: "Failed to update cart item status" },
      { status: 500 }
    );
  }
}
