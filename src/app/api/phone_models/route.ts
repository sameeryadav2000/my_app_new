// src/app/api/iphone/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page"));
    const limit = Number(searchParams.get("limit"));

    const offset = (page - 1) * limit;

    type CountResult = { count: bigint }[];

    const phoneModelsCount = await prisma.$queryRaw<CountResult>`
      SELECT COUNT(DISTINCT phoneid) as count FROM PhoneModelDetails
    `;

    const phoneModels = await prisma.$queryRaw`
  SELECT 
    pm.*,
    (SELECT MIN(pmd.price) 
     FROM PhoneModelDetails pmd 
     WHERE pmd.phoneId = pm.id) as startingPrice,
    (SELECT mi.image
     FROM ModelImage mi
     WHERE mi.phoneId = pm.id
     AND mi.colorId = (
       SELECT pmd.colorId
       FROM PhoneModelDetails pmd
       WHERE pmd.phoneId = pm.id
       AND pmd.colorId IS NOT NULL
       LIMIT 1
     )
     LIMIT 1) as image
  FROM PhoneModel pm
  INNER JOIN PhoneModelDetails pmd ON pm.id = pmd.phoneId
  GROUP BY pm.id
  ORDER BY pm.id ASC
  LIMIT ${limit} OFFSET ${offset}
`;

    return NextResponse.json({
      success: true,
      data: phoneModels,
      total: Number(phoneModelsCount[0].count),
      page,
      limit,
      totalPages: Math.ceil(Number(phoneModelsCount[0].count) / limit),
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
