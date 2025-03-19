// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);

  const productId = searchParams.get("productId");
  const modelId = searchParams.get("modelId");

  // Case 1: Get all reviews for a model (for product detail page)
  if (modelId) {
    try {
      const reviews = await prisma.review.findMany({
        where: {
          modelId: parseInt(modelId),
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

      // Format the response to include userName
      const formattedReviews = reviews.map((review) => ({
        id: review.id,
        userId: review.userId,
        modelId: review.modelId,
        rating: review.rating,
        title: review.title || "",
        comment: review.comment,
        createdAt: review.createdAt,
        userName: review.user
          ? `${review.user.firstName || ""} ${review.user.lastName || ""}`.trim() || "Anonymous User"
          : "Anonymous User",
      }));

      return NextResponse.json({ reviews: formattedReviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
  } else if (productId) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          reviews: {
            where: {
              modelId: parseInt(productId),
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

// POST a new review
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      {
        success: false,
        error: "You must be logged in to submit a review",
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { productId, rating, title, review: reviewText } = body;

    if (!productId || !rating || !title || !reviewText) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const parsedModelId = typeof productId === "string" ? parseInt(productId, 10) : productId;

    // Get user from database based on email from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        modelId: parsedModelId,
      },
    });

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        title,
        comment: reviewText,
        userId: user.id,
        modelId: parsedModelId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        review: review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create review",
      },
      { status: 500 }
    );
  }
}
