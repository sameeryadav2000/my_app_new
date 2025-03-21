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

    // Convert phone_type to integer for the database query
    const phoneId = parseInt(phone_type);
    
    // Query for all dropdown models matching the phoneId directly
    const phoneModels = await prisma.phoneModel.findMany({
      where: {
        phoneId: phoneId,
      },
    });

    return NextResponse.json({
      success: true,
      data: phoneModels.map((model) => ({
        id: model.id,
        model: model.model,
        phoneId: model.phoneId,
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