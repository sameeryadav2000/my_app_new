import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const phones = await prisma.phone.findMany({
      select: {
        id: true,
        phone: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      phones: phones,
    });
  } catch (error) {
    console.error("Error fetching phones:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch phones",
      },
      { status: 500 }
    );
  }
}
