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
        phone: true,
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

export async function PUT(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();

    // Get the product ID from the form data now, instead of params
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

    // Check if the product exists
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

    // Extract text fields
    const createdBy = formData.get("userId") as string;
    const phoneType = formData.get("phoneType") as string;
    const model = formData.get("model") as string;
    const condition = formData.get("condition") as string;
    const storage = formData.get("storage") as string;
    const color = formData.get("color") as string;
    const price = parseFloat(formData.get("price") as string);
    const available = formData.get("available") === "yes";

    // Get the IDs from the form directly
    const phoneId = parseInt(formData.get("phoneId") as string);
    const colorId = parseInt(formData.get("colorId") as string);

    // Check if user has permission to edit this product
    if (existingProduct.createdBy !== createdBy) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to edit this product",
        },
        { status: 403 }
      );
    }

    // Update the phone model details
    const updatedProduct = await prisma.phoneModelDetails.update({
      where: { id: productId },
      data: {
        title: model,
        phoneId: phoneId,
        condition: condition,
        storage: storage,
        colorId: colorId,
        price: price,
        available: available,
      },
    });

    // Check if there are new images to upload
    const images = formData.getAll("images") as File[];
    let savedImages = [];

    if (images && images.length > 0) {
      // Create a unique folder name with createdBy, timestamp, and phoneType
      const timestamp = Date.now();
      const productFolderName = `user_${createdBy}_${phoneType}_${timestamp}`.replace(/\s+/g, "_");
      const uploadDir = join(process.cwd(), "public", "uploads", "products", productFolderName);

      // Create directory if it doesn't exist
      await mkdir(uploadDir, { recursive: true });

      // Delete old images from database (not from file system to keep backups)
      await prisma.modelImage.deleteMany({
        where: {
          phoneId: phoneId,
          colorId: colorId,
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
              colorId: colorId,
              phoneId: phoneId,
            },
          })
        );
      }

      // Wait for all image uploads to complete
      savedImages = await Promise.all(imagePromises);
    } else {
      // If no new images, fetch the existing ones
      savedImages = await prisma.modelImage.findMany({
        where: {
          phoneId: phoneId,
          colorId: colorId,
        },
      });
    }

    // Return a success response
    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: {
        ...updatedProduct,
        images: savedImages,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
