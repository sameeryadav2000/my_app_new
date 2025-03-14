import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json({ error: "Phone type is required" }, { status: 400 });
    }

    // Use findFirst since the phone field is not marked as @unique
    const phone = await prisma.phone.findFirst({
      where: {
        phone: type,
      },
    });

    // If no phone found with the given type
    if (!phone) {
      return NextResponse.json({ error: "Phone not found" }, { status: 404 });
    }

    // Query for all dropdown models matching the phoneId
    const phoneModels = await prisma.phoneModel.findMany({
      where: {
        phoneId: phone.id,
      },
    });

    // Return just the models array
    return NextResponse.json({
      phoneId: phone.id,
      models: phoneModels.map((model) => ({
        id: model.id,
        name: model.model,
      })),
    });
  } catch (error) {
    console.error("Error fetching phone details:", error);
    return NextResponse.json({ error: "Failed to fetch phone details" }, { status: 500 });
  }
}
