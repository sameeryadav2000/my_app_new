// app/dash_api/phone_model_details/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { join } from "path";
import { mkdir } from "fs/promises";
import prisma from "../../../../lib/prisma"; // Import your database client

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const phoneModelDetails = await prisma.phoneModelDetails.findMany({
      where: {
        createdBy: userId,
      },
      include: {
        phone: {
          include: {
            phone: true,
          },
        },
        color: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    const detailsWithImages = await Promise.all(
      phoneModelDetails.map(async (detail) => {
        const images = await prisma.modelImage.findMany({
          where: {
            phoneId: detail.phoneId,
            colorId: detail.colorId,
          },
        });
        return { ...detail, images };
      })
    );

    return NextResponse.json({
      success: true,
      data: detailsWithImages,
    });
  } catch (error) {
    console.error("Error fetching phone model details:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch phone model details",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const createdBy = formData.get("createdBy") as string;
    const title = formData.get("title") as string;
    const condition = formData.get("condition") as string;
    const storage = formData.get("storage") as string;
    const price = parseFloat(formData.get("price") as string);
    const phoneId = parseInt(formData.get("phoneId") as string);
    const colorId = parseInt(formData.get("colorId") as string);

    const existingProduct = await prisma.phoneModelDetails.findFirst({
      where: {
        phoneId: phoneId,
        colorId: colorId,
        storage: storage,
        condition: condition,
        createdBy: createdBy,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have this product listed. Please edit the existing listing instead.",
        },
        { status: 400 }
      );
    }

    const images = formData.getAll("images") as File[];

    const timestamp = Date.now();
    const productFolderName = `user_${createdBy}_${title}_${timestamp}`.replace(/\s+/g, "_");
    const uploadDir = join(process.cwd(), "public", "uploads", "products", productFolderName);

    await mkdir(uploadDir, { recursive: true });

    const phoneModelDetails = await prisma.phoneModelDetails.create({
      data: {
        title: title,
        phoneId: phoneId,
        condition: condition,
        storage: storage,
        colorId: colorId,
        price: price,
        createdBy: createdBy,
      },
    });

    const imagePromises = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `image_${i + 1}_${image.name.replace(/\s+/g, "_")}`;
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      const relativePath = `/uploads/products/${productFolderName}/${fileName}`;

      imagePromises.push(
        prisma.modelImage.create({
          data: {
            image: relativePath,
            colorId: colorId,
            phoneId: phoneId,
          },
        })
      );
    }
    const savedImages = await Promise.all(imagePromises);

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error handling phone model details upload:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to add phone model detail",
      },
      { status: 200 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();

    const productId = parseInt(formData.get("id") as string);

    if (!productId || isNaN(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.phoneModelDetails.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const createdBy = formData.get("createdBy") as string;
    const title = formData.get("title") as string;
    const condition = formData.get("condition") as string;
    const storage = formData.get("storage") as string;
    const price = parseFloat(formData.get("price") as string);
    const phoneId = parseInt(formData.get("phoneId") as string);
    const colorId = parseInt(formData.get("colorId") as string);
    const available = formData.get("available") === "yes";

    if (existingProduct.createdBy !== createdBy) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to edit this product",
        },
        { status: 403 }
      );
    }

    await prisma.phoneModelDetails.update({
      where: { id: productId },
      data: {
        title: title,
        phoneId: phoneId,
        condition: condition,
        storage: storage,
        colorId: colorId,
        price: price,
        available: available,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating phone model details:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update phone model detail",
      },
      { status: 200 }
    );
  }
}
