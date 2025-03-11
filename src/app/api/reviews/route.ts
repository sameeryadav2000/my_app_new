// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);

  // Get query parameters
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
          ? `${review.user.firstName || ""} ${
              review.user.lastName || ""
            }`.trim() || "Anonymous User"
          : "Anonymous User",
      }));

      return NextResponse.json({ reviews: formattedReviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }
  }

  // Case 2: Check if user has reviewed a product (for orders page)
  else if (productId) {
    // Authentication required for checking user's own review
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    try {
      // Get user from database based on email from session
      const user = await prisma.user.findUnique({
        where: { email: session.user.email as string },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if a review exists for this model by this user
      const review = await prisma.review.findFirst({
        where: {
          modelId: parseInt(productId),
          userId: user.id,
        },
      });

      if (review) {
        return NextResponse.json({
          isReviewed: true,
          reviews: {
            id: review.id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            createdAt: review.createdAt,
          },
        });
      } else {
        return NextResponse.json({ isReviewed: false });
      }
    } catch (error) {
      console.error("Error checking review status:", error);
      return NextResponse.json(
        { error: "Failed to check review status" },
        { status: 500 }
      );
    }
  }

  // No valid parameters provided
  return NextResponse.json(
    { error: "Either productId or modelId is required" },
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

    const parsedModelId =
      typeof productId === "string" ? parseInt(productId, 10) : productId;

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
