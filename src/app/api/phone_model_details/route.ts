// src/app/api/iphone_models/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing id parameter",
        },
        { status: 401 }
      );
    }

    const phoneId = parseInt(id);

    // Fetch all phone model details for this phone ID
    const allPhoneDetails = await prisma.phoneModelDetails.findMany({
      where: {
        phoneId,
        available: true,
        purchased: false,
      },
      select: {
        id: true,
        phoneId: true,
        storage: true,
        condition: true,
        colorId: true,
        price: true,
        sellerId: true,
        // Include all relations
        color: true,
        seller: true,
        phone: {
          include: {
            phone: true,
          },
        },
      },
    });

    // Get all images for all color variations
    const allColorIds = [...new Set(allPhoneDetails.filter((item) => item.colorId !== null).map((item) => item.colorId))];

    const allImages = await prisma.modelImage.findMany({
      where: {
        phoneId: phoneId,
        colorId: {
          in: allColorIds as number[],
        },
      },
      select: {
        colorId: true,
        image: true,
        mainImage: true,
      },
    });

    // Combine the phone details with their corresponding images
    const fullData = allPhoneDetails.map((detail) => {
      const detailImages = allImages.filter((img) => img.colorId === detail.colorId);

      return {
        id: detail.id,
        phoneId: detail.phoneId,
        condition: detail.condition,
        storage: detail.storage,
        colorId: detail.colorId,
        colorName: detail.color?.color,
        price: detail.price,
        sellerId: detail.sellerId,
        sellerName: detail.seller?.businessName,
        phoneName: detail.phone?.phone?.phone,
        phoneModel: detail.phone?.model,
        images: detailImages.map((img) => ({
          image: img.image,
          mainImage: img.mainImage,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: fullData,
    });
  } catch (error) {
    console.error("Error fetching phone model details:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch phone model details",
      },
      { status: 500 }
    );
  }
}
