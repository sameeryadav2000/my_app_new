// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth_options";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const purchasedItemId = searchParams.get("purchasedItemId");
  const phoneModelId = searchParams.get("phoneModelId");
  const colorId = searchParams.get("colorId");

  if (phoneModelId && colorId && colorId !== "undefined") {
    try {
      const reviews = await prisma.review.findMany({
        where: {
          phoneModelId: parseInt(phoneModelId),
          colorId: parseInt(colorId),
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const formattedReviews = reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.createdAt,
        userName: review.user
          ? `${review.user.firstName ? review.user.firstName.charAt(0).toUpperCase() + review.user.firstName.slice(1) : ""} ${
              review.user.lastName ? review.user.lastName.charAt(0).toUpperCase() + review.user.lastName.slice(1) : ""
            }`.trim() || "Anonymous User"
          : "Anonymous User",
      }));

      return NextResponse.json({
        success: true,
        data: formattedReviews,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);

      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Failed to fetch reviews",
        },
        { status: 500 }
      );
    }
  } else if (phoneModelId) {
    try {
      const reviews = await prisma.review.findMany({
        where: {
          phoneModelId: parseInt(phoneModelId),
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          phoneModels: true,
          color: true,
        },
      });

      const formattedReviews = reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        colorName: review.color?.color,
        phoneModelName: review.phoneModels.model,
        createdAt: review.createdAt,
        userName: review.user
          ? `${review.user.firstName ? review.user.firstName.charAt(0).toUpperCase() + review.user.firstName.slice(1) : ""} ${
              review.user.lastName ? review.user.lastName.charAt(0).toUpperCase() + review.user.lastName.slice(1) : ""
            }`.trim() || "Anonymous User"
          : "Anonymous User",
      }));

      return NextResponse.json({
        success: true,
        data: formattedReviews,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);

      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Failed to fetch reviews",
        },
        { status: 500 }
      );
    }
  } else if (purchasedItemId) {
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
        include: {
          reviews: {
            where: {
              purchasedItemId: purchasedItemId,
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

      if (user.reviews && user.reviews.length > 0) {
        const review = user.reviews[0];
        return NextResponse.json({
          success: true,
          isReviewed: true,
          review: {
            id: review.id,
            purchasedItemId: review.purchasedItemId,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            createdAt: review.createdAt,
          },
        });
      } else {
        return NextResponse.json({
          success: true,
          isReviewed: false,
        });
      }
    } catch (error) {
      console.error("Error checking reviews:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch reviews",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    {
      success: false,
      message: "Either productId or modelId is required",
    },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { purchasedItemId, productColorId, phoneModelId, rating, title, review: reviewText } = body;

    if (!purchasedItemId || !phoneModelId || !rating || !title || !reviewText || !productColorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
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

    await prisma.review.create({
      data: {
        rating,
        title,
        comment: reviewText,
        colorId: productColorId,
        userId: user.id,
        phoneModelId: phoneModelId,
        purchasedItemId: purchasedItemId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating review:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create review",
      },
      { status: 500 }
    );
  }
}
