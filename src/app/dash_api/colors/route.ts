import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const colors = await prisma.color.findMany();

    return NextResponse.json({
      success: true,
      data: colors.map((color) => ({
        id: color.id,
        color: color.color,
      })),
    });
  } catch (error) {
    console.error("Error fetching colors:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch colors",
      },
      { status: 500 }
    );
  }
}
