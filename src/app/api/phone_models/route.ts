// src/app/api/phone_models/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page"));
    const limit = Number(searchParams.get("limit"));
    const id = Number(searchParams.get("id"));

    const offset = (page - 1) * limit;

    const phoneModelsCount = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT pmd.phoneId) as count
        FROM PhoneModelDetails pmd
        JOIN PhoneModel pm ON pmd.phoneId = pm.id
        WHERE pm.phoneId = ${id}
    `;

    const totalCount = Number(phoneModelsCount[0]?.count || 0);

    const phoneModels = await prisma.$queryRaw`
        SELECT 
        pm.*,
        (SELECT MIN(pmd.price) 
        FROM PhoneModelDetails pmd 
        WHERE pmd.phoneId = pm.id
        AND pmd.available = true) as startingPrice,
        (SELECT mi.image
        FROM ModelImage mi
        WHERE mi.phoneId = pm.id
        AND mi.mainImage = true
        LIMIT 1) as image
      FROM PhoneModel pm
      WHERE pm.phoneId = ${id}
      AND EXISTS (
        SELECT 1 
        FROM PhoneModelDetails pmd 
        WHERE pmd.phoneId = pm.id
        AND pmd.available = true
      )
      GROUP BY pm.id
      ORDER BY pm.id ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return NextResponse.json({
      success: true,
      data: phoneModels,
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
