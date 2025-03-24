// src/app/api/cart/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "../../../../lib/prisma";
import { CartItem } from "@/context/CartContext";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { title } from "process";

export async function GET(request: NextRequest) {
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
        cartItems: {
          include: {
            title: true,
            color: true,
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

    const cart = {
      items: user.cartItems.map((item) => ({
        id: item.itemId,
        titleId: item.title.id,
        titleName: item.title.model,
        condition: item.condition,
        storage: item.storage,
        colorId: item.color.id,
        colorName: item.color.color,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalItems: user.cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subTotalPrice: user.cartItems.reduce((sum, item) => sum + parseFloat(item.price.toString()) * item.quantity, 0),
    };

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch cart",
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

    const body = await request.json();

    const isFullCart = body.cart && Array.isArray(body.cart.items);
    const cartItems = isFullCart ? body.cart.items : [body.cartItem];

    if (!cartItems.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No cart items provided",
        },
        { status: 400 }
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

    for (const item of cartItems) {
      if (!item.id || !item.titleId || !item.price) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid cart item: missing required fields",
          },
          { status: 400 }
        );
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId: user.id,
          itemId: item.id,
          condition: item.condition,
          storage: item.storage,
          color: item.color,
        },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: isFullCart ? existingItem.quantity + item.quantity : existingItem.quantity + 1,
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId: user.id,
            itemId: item.id,
            titleId: parseInt(item.titleId),
            condition: item.condition,
            storage: item.storage,
            colorId: parseInt(item.colorId),
            price: item.price,
            quantity: isFullCart ? item.quantity : 1,
            image: item.image,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cart updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating cart:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update cart",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    const body = await request.json();
    const { items, orderNumber } = body;

    for (const item of items) {
      await prisma.purchasedItem.create({
        data: {
          userId: user.id,
          itemId: item.id,
          titleId: parseInt(item.titleId),
          condition: item.condition,
          storage: item.storage,
          colorId: parseInt(item.colorId),
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          orderId: orderNumber,
        },
      });
    }

    await prisma.cartItem.deleteMany({
      where: {
        userId: user.id,
        itemId: {
          in: items.map((item: CartItem) => item.id),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for the order!",
    });
  } catch (error) {
    console.error("Error updating cart item status:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error buying the product",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const phoneModelId = searchParams.get("id");

    if (!phoneModelId) {
      return NextResponse.json(
        {
          success: false,
          message: "iPhone model ID is required",
        },
        { status: 400 }
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

    await prisma.cartItem.deleteMany({
      where: {
        userId: user.id,
        itemId: phoneModelId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Item Deleted Successfully",
    });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete item",
      },
      { status: 500 }
    );
  }
}
