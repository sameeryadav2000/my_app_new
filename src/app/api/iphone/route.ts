// src/app/api/iphone/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const offset = (page - 1) * limit;

  try {
    const totalCount = await prisma.iphone.count();

    const iphones = await prisma.iphone.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        id: "asc", // You can change the ordering as needed
      },
    });

    return NextResponse.json({
      success: true,
      data: iphones,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error fetching iPhones:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch iPhones",
      },
      { status: 500 }
    );
  }
}
