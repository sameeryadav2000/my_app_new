// src/app/api/phone_models/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ success: false, message: "Phone ID is required" }, { status: 400 });
    }

    const offset = (page - 1) * limit;

    // Count total available phone models for this phone
    const totalCount = await prisma.phoneModel.count({
      where: {
        phoneId: id,
        details: {
          some: {
            available: true,
          },
        },
      },
    });

    // Fetch phone models with details and images in a single query
    const phoneModels = await prisma.phoneModel.findMany({
      where: {
        phoneId: id,
        details: {
          some: {
            available: true,
          },
        },
      },
      include: {
        details: {
          where: {
            available: true,
          },
          orderBy: {
            price: "asc",
          },
        },
        images: {
          where: {
            mainImage: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
      skip: offset,
      take: limit,
    });

    // Transform the result to match your expected format
    const formattedPhoneModels = phoneModels.map((model) => ({
      ...model,
      startingPrice: model.details.length > 0 ? model.details[0].price : null,
      image: model.images.length > 0 ? model.images[0].image : null,
      // Remove nested relations from the response
      details: undefined,
      images: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: formattedPhoneModels,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error fetching phone models:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch phone models",
      },
      { status: 500 }
    );
  }
}
