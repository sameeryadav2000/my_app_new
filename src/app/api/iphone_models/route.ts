// src/app/api/iphone_models/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const condition = searchParams.get("condition");
  const storage = searchParams.get("storage");

  try {
    // Validate id parameter
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid or missing id parameter" },
        { status: 400 }
      );
    }

    const iphoneId = parseInt(id);

    // Get distinct conditions for an iPhone model
    if (!condition) {
      const conditions = await prisma.iphoneModels.findMany({
        where: {
          iphoneId: iphoneId,
        },
        distinct: ["condition"],
        select: {
          condition: true,
        },
      });
      return NextResponse.json({ result: conditions });
    }

    // Get distinct storage options for a specific condition
    if (condition && !storage) {
      const storageOptions = await prisma.iphoneModels.findMany({
        where: {
          iphoneId: iphoneId,
          condition: condition,
        },
        distinct: ["storage"],
        select: {
          storage: true,
        },
      });
      return NextResponse.json({ result: storageOptions });
    }

    // Get color and price options for specific condition and storage
    if (condition && storage) {
      const colorOptions = await prisma.iphoneModels.findMany({
        where: {
          iphoneId: iphoneId,
          condition: condition,
          storage: storage,
        },
        select: {
          id: true,
          color: true,
          price: true,
        },
      });
      return NextResponse.json({ result: colorOptions });
    }

    return NextResponse.json({ result: [] });
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
