// src/app/api/model_image/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const iphoneId = searchParams.get("iphoneId");
    const colorId = searchParams.get("colorId");

    if (!iphoneId || isNaN(Number(iphoneId))) {
      return NextResponse.json({ message: "Invalid or missing iphoneModelId parameter" }, { status: 400 });
    }
    if (!colorId || isNaN(Number(colorId))) {
      return NextResponse.json({ message: "Invalid or missing colorId parameter" }, { status: 400 });
    }

    const modelImages = await prisma.modelImage.findMany({
      where: {
        phoneId: parseInt(iphoneId),
        colorId: parseInt(colorId),
      },
    });

    return NextResponse.json({ result: modelImages });
  } catch (error) {
    console.error("Error fetching model images:", error);
    return NextResponse.json({ message: "Failed to fetch model images" }, { status: 500 });
  }
}
