// src/app/api/iphone/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    const iphones = await prisma.iphone.findMany();
    
    return NextResponse.json({ result: iphones });
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { message: "Failed to fetch iPhone data", error },
      { status: 500 }
    );
  }
}