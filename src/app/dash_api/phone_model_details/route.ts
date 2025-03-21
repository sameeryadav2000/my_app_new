// app/dash_api/phone_model_details/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
        admin: true,
        isActive: true,
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to view products",
        },
        { status: 403 }
      );
    }

    // Fetch all products with related data
    const products = await prisma.phoneModelDetails.findMany({
      include: {
        phone: {
          include: {
            phone: true, // Gets the Phone from PhoneModel
          },
        },
        color: true,
        seller: {
          select: {
            id: true,
            businessName: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response data for all products
    const responseData = products.map((product) => ({
      id: product.id.toString(),
      phoneType: product.phone.phoneId.toString(),
      phoneTypeName: product.phone.phone.phone,
      model: product.phoneId.toString(),
      modelName: product.phone.model, // Use model name from the relation
      condition: product.condition,
      storage: product.storage,
      color: product.colorId?.toString() || "",
      colorName: product.color?.color || "",
      price: product.price.toString(),
      availability: product.available ? "In Stock" : "Out of Stock",
      createdAt: product.createdAt?.toISOString() || "",
      sellerId: product.sellerId || "",
      sellerBusinessName: product.seller?.businessName || "",
    }));

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
        admin: true,
        isActive: true,
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to add products",
        },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Extract data from the request body
    const {
      phoneType,
      modelId,
      condition,
      storage,
      color,
      price,
      availability,
      sellerId,
    } = data;

    // Validate required fields
    if (!modelId || !condition || !storage || !color || !price || !sellerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields are missing",
        },
        { status: 400 }
      );
    }

    // Check if the model exists
    const model = await prisma.phoneModel.findUnique({
      where: {
        id: parseInt(modelId),
      },
      include: {
        phone: true,
      },
    });

    if (!model) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected model does not exist",
        },
        { status: 400 }
      );
    }

    // Check if a similar product already exists
    const existingProduct = await prisma.phoneModelDetails.findFirst({
      where: {
        phoneId: parseInt(modelId),
        colorId: parseInt(color),
        storage: storage,
        condition: condition,
        sellerId: sellerId,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "A similar product already exists. Please edit the existing listing instead.",
        },
        { status: 400 }
      );
    }

    // Convert availability string to boolean
    const isAvailable = availability === "In Stock";

    // Create the new product
    const newProduct = await prisma.phoneModelDetails.create({
      data: {
        phoneId: parseInt(modelId),
        condition: condition,
        storage: storage,
        colorId: parseInt(color),
        price: parseFloat(price),
        available: isAvailable,
        purchased: false, // Default value
        sellerId: sellerId,
        createdBy: adminUser.id, // Admin is the creator
      },
      include: {
        phone: {
          include: {
            phone: true,
          },
        },
        color: true,
        seller: {
          select: {
            id: true,
            businessName: true,
            name: true,
          },
        },
      },
    });

    // Format the response data to match what the frontend expects
    const responseData = {
      id: newProduct.id.toString(),
      phoneType: newProduct.phone.phoneId.toString(),
      phoneTypeName: newProduct.phone.phone.phone,
      model: newProduct.phoneId.toString(),
      modelName: newProduct.phone.model,
      condition: newProduct.condition,
      storage: newProduct.storage,
      color: newProduct.colorId?.toString() || "",
      colorName: newProduct.color?.color || "",
      price: newProduct.price.toString(),
      availability: newProduct.available ? "In Stock" : "Out of Stock",
      createdAt: newProduct.createdAt?.toISOString() || new Date().toISOString(),
      sellerId: newProduct.sellerId || "",
      sellerBusinessName: newProduct.seller?.businessName || "",
    };

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error adding product:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to add product",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
        admin: true,
        isActive: true,
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to update products",
        },
        { status: 403 }
      );
    }

    // Get the product ID from URL params
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to this admin
    const existingProduct = await prisma.phoneModelDetails.findFirst({
      where: {
        id: parseInt(id),
        createdBy: adminUser.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found or you don't have permission to update it",
        },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Extract data from the request body
    const {
      phoneType,
      modelId,
      condition,
      storage,
      color,
      price,
      availability,
      sellerId,
    } = data;

    // Validate required fields
    if (!modelId || !condition || !storage || !color || !price || !sellerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields are missing",
        },
        { status: 400 }
      );
    }

    // Check if the model exists
    const model = await prisma.phoneModel.findUnique({
      where: {
        id: parseInt(modelId),
      },
    });

    if (!model) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected model does not exist",
        },
        { status: 400 }
      );
    }

    // Check if update would create a duplicate
    const similarProduct = await prisma.phoneModelDetails.findFirst({
      where: {
        id: { not: parseInt(id) },
        phoneId: parseInt(modelId),
        colorId: parseInt(color),
        storage: storage,
        condition: condition,
        sellerId: sellerId,
        createdBy: adminUser.id,
      },
    });

    if (similarProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "A similar product already exists. Please edit the existing listing instead.",
        },
        { status: 400 }
      );
    }

    // Update the product
    const updatedProduct = await prisma.phoneModelDetails.update({
      where: {
        id: parseInt(id),
      },
      data: {
        phoneId: parseInt(modelId),
        condition: condition,
        storage: storage,
        colorId: parseInt(color),
        price: parseFloat(price),
        available: availability === "In Stock",
        sellerId: sellerId,
      },
      include: {
        phone: {
          include: {
            phone: true,
          },
        },
        color: true,
        seller: {
          select: {
            id: true,
            businessName: true,
            name: true,
          },
        },
      },
    });

    // Format the response data
    const responseData = {
      id: updatedProduct.id.toString(),
      phoneType: updatedProduct.phone.phoneId.toString(),
      phoneTypeName: updatedProduct.phone.phone.phone,
      model: updatedProduct.phoneId.toString(),
      modelName: updatedProduct.phone.model,
      condition: updatedProduct.condition,
      storage: updatedProduct.storage,
      color: updatedProduct.colorId?.toString() || "",
      colorName: updatedProduct.color?.color || "",
      price: updatedProduct.price.toString(),
      availability: updatedProduct.available ? "In Stock" : "Out of Stock",
      createdAt: updatedProduct.createdAt?.toISOString() || new Date().toISOString(),
      sellerId: updatedProduct.sellerId || "",
      sellerBusinessName: updatedProduct.seller?.businessName || "",
    };

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update product",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
        admin: true,
        isActive: true,
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to delete products",
        },
        { status: 403 }
      );
    }

    // Get the product ID from URL params
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to this admin
    const existingProduct = await prisma.phoneModelDetails.findFirst({
      where: {
        id: parseInt(id),
        createdBy: adminUser.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found or you don't have permission to delete it",
        },
        { status: 404 }
      );
    }

    // Delete the product
    await prisma.phoneModelDetails.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete product",
      },
      { status: 500 }
    );
  }
}