import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const phone_types = await prisma.phone.findMany();

    return NextResponse.json({
      success: true,
      data: phone_types.map((phone_type) => ({
        id: phone_type.id,
        color: phone_type.phone,
      })),
    });
  } catch (error) {
    console.error("Error fetching phone types:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch phone types",
      },
      { status: 500 }
    );
  }
}
