// src/app/api/slideshow/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const slideshowImages = await prisma.slideshow.findMany();

    return NextResponse.json({ result: slideshowImages });
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { message: "Failed to fetch slideshow data", error },
      { status: 500 }
    );
  }
}
