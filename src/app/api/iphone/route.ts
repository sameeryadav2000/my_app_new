// src/app/api/iphone/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";


export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
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

    if (req.signal.aborted) {
      return NextResponse.json(
        { message: "Request was aborted during processing" },
        { status: 499 }
      );
    }

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
      { message: "Failed to fetch iPhones", error },
      { status: 500 }
    );
  }
}
