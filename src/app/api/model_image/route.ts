// src/app/api/model_image/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const iphoneModelId = searchParams.get("iphoneModelId");

    if (!iphoneModelId || isNaN(Number(iphoneModelId))) {
      return NextResponse.json(
        { message: "Invalid or missing iphoneModelId parameter" },
        { status: 400 }
      );
    }

    const modelImages = await prisma.modelImage.findMany({
      where: {
        iphoneModelId: parseInt(iphoneModelId),
      },
    });

    return NextResponse.json({ result: modelImages });
  } catch (error) {
    console.error("Error fetching model images:", error);
    return NextResponse.json(
      { message: "Failed to fetch model images" },
      { status: 500 }
    );
  }
}
