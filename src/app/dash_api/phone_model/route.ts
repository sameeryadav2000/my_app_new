import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone_type = searchParams.get("phone_type");

    if (!phone_type) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone type is required",
        },
        { status: 400 }
      );
    }

    const phone = await prisma.phone.findFirst({
      where: {
        phone: phone_type,
      },
    });

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone not found",
        },
        { status: 404 }
      );
    }

    // Query for all dropdown models matching the phoneId
    const phoneModels = await prisma.phoneModel.findMany({
      where: {
        phoneId: phone.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: phoneModels.map((model) => ({
        phoneModelId: model.id,
        phoneModel: model.model,
        phoneId: model.phoneId,
        bestseller: model.bestseller,
      })),
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
