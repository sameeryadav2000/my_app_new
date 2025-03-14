import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const colors = await prisma.color.findMany();

    return NextResponse.json({
      colors: colors.map((color) => ({
        id: color.id,
        color: color.color,
      })),
    });
  } catch (error) {
    console.error("Error fetching colors:", error);
    return NextResponse.json({ error: "Failed to fetch colors" }, { status: 500 });
  }
}
