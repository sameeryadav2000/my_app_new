// app/dash_api/phone_model_details/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";
import prisma from "../../../../lib/prisma"; // Import your database client

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();

    // Extract text fields
    const createdBy = formData.get("userId") as string; // Changed userId to createdBy
    const phoneType = formData.get("phoneType") as string;
    const model = formData.get("model") as string;
    const condition = formData.get("condition") as string;
    const storage = formData.get("storage") as string;
    const color = formData.get("color") as string;
    const price = parseFloat(formData.get("price") as string);
    const available = formData.get("available") as string;

    // Get the IDs from the form directly since they're pre-populated
    const phoneId = formData.get("phoneId") as string;
    const colorId = formData.get("colorId") as string;

    // Check if the same product by this user already exists
    const existingProduct = await prisma.phoneModelDetails.findFirst({
      where: {
        phoneId: parseInt(phoneId),
        colorId: parseInt(colorId),
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

    // Create a unique folder name with createdBy, timestamp, and phoneType
    const timestamp = Date.now();
    const productFolderName = `user_${createdBy}_${phoneType}_${timestamp}`.replace(/\s+/g, "_");
    const uploadDir = join(process.cwd(), "public", "uploads", "products", productFolderName);

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Save the phone model details first
    const phoneModelDetails = await prisma.phoneModelDetails.create({
      data: {
        title: model,
        phoneId: parseInt(phoneId),
        condition: condition,
        storage: storage,
        colorId: parseInt(colorId),
        price: price,
        createdBy: createdBy,
      },
    });
    // Array to store image processing promises
    const imagePromises = [];

    // Process each image
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create a safe filename
      const fileName = `image_${i + 1}_${image.name.replace(/\s+/g, "_")}`;
      const filePath = join(uploadDir, fileName);

      // Write the file
      await writeFile(filePath, buffer);

      // Store the relative path for database
      const relativePath = `/uploads/products/${productFolderName}/${fileName}`;

      // Add to the modelimage table
      imagePromises.push(
        prisma.modelImage.create({
          data: {
            image: relativePath,
            colorId: parseInt(colorId),
            phoneId: parseInt(phoneId),
          },
        })
      );
    }
    // Wait for all image uploads to complete
    const savedImages = await Promise.all(imagePromises);

    // Return a success response
    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      productId: phoneModelDetails.id,
      data: {
        ...phoneModelDetails,
        images: savedImages,
      },
    });
  } catch (error) {
    console.error("Error handling product upload:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add product",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
