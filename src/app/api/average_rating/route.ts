// src/app/api/product-ratings/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get("modelId");

  if (!modelId) {
    return NextResponse.json({ error: "Model ID is required" }, { status: 400 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { phoneModelId: parseInt(modelId) },
    });

    if (reviews.length === 0) {
      return NextResponse.json({ averageRating: 0, totalReviews: 0 });
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return NextResponse.json({
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return NextResponse.json({ error: "Failed to calculate average rating" }, { status: 500 });
  }
}
