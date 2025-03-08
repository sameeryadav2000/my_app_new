// src/app/api/iphone_models/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const id = searchParams.get("id");
    const condition = searchParams.get("condition");
    const storage = searchParams.get("storage");

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { message: "Invalid or missing id parameter" },
        { status: 400 }
      );
    }

    const iphoneId = parseInt(id);

    const baseQueryConfig = {
      where: {
        iphoneId,
        ...(condition && { condition }),
        ...(storage && { storage }),
      },
    };

    if (!condition) {
      const conditions = await prisma.iphoneModels.findMany({
        ...baseQueryConfig,
        distinct: ["condition"],
        select: {
          condition: true,
        },
      });
      return NextResponse.json({ result: conditions });
    }

    if (condition && !storage) {
      const storageOptions = await prisma.iphoneModels.findMany({
        ...baseQueryConfig,
        distinct: ["storage"],
        select: {
          storage: true,
        },
      });

      return NextResponse.json({ result: storageOptions });
    }

    // Scenario 3: Get all color and price options for a specific condition and storage
    const colorOptions = await prisma.iphoneModels.findMany({
      ...baseQueryConfig,
      select: {
        id: true,
        color: true,
        colorId: true,
        iphoneId: true,
        price: true,
      },
    });
    

    return NextResponse.json({ result: colorOptions });
  } catch (error) {
    console.error("Error fetching iPhone models:", error);
    return NextResponse.json(
      { message: "Failed to fetch iPhone models" },
      { status: 500 }
    );
  }
}
