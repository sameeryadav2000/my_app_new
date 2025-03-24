// src/app/api/iphone_models/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const condition = searchParams.get("condition");
    const storage = searchParams.get("storage");

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

    const baseQueryConfig = {
      where: {
        phoneId,
        ...(condition && { condition }),
        ...(storage && { storage }),
      },
    };

    if (!condition) {
      const conditions = await prisma.phoneModelDetails.findMany({
        ...baseQueryConfig,
        distinct: ["condition"],
        select: {
          condition: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: conditions,
      });
    }

    if (condition && !storage) {
      const storageOptions = await prisma.phoneModelDetails.findMany({
        ...baseQueryConfig,
        distinct: ["storage"],
        select: {
          storage: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: storageOptions,
      });
    }

    const colorOptions = await prisma.phoneModelDetails.findMany({
      ...baseQueryConfig,
      select: {
        id: true,
        colorId: true,
        phoneId: true,
        price: true,
        color: true, // This will select all fields from the color model
        phone: {
          include: {
            phone: true, // This will include all fields from the nested phone relation
          },
        },
      },
    });

    const colorOptionsWithImages = await Promise.all(
      colorOptions.map(async (option) => {
        if (option.colorId) {
          const images = await prisma.modelImage.findMany({
            where: {
              phoneId: phoneId,
              colorId: option.colorId,
            },
            select: {
              image: true,
              mainImage: true, // Added mainImage field selection
            },
          });

          return {
            ...option,
            // Include both image and mainImage in the returned objects
            images: images.map((img) => ({
              image: img.image,
              mainImage: img.mainImage,
            })),
          };
        }
        return {
          ...option,
          images: [],
        };
      })
    );

    const selectedData = colorOptionsWithImages.map((option) => ({
      id: option.id,
      colorName: option.color?.color,
      colorId: option.colorId,
      phoneId: option.phoneId,
      idForReview: option.phone.phone.id,
      price: option.price,
      images: option.images,
    }));

    return NextResponse.json({
      success: true,
      data: selectedData,
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
