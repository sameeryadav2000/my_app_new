import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
          message: "You don't have permission to create sellers",
        },
        { status: 403 }
      );
    }

    const sellers = await prisma.seller.findMany({
      where: {
        adminId: adminUser.id,
      },
      select: {
        id: true,
        businessName: true,
        name: true,
        email: true,
        phone: true,
        taxId: true,
        address: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Sellers retrieved successfully",
        data: sellers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching sellers:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sellers",
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
          message: "You don't have permission to create sellers",
        },
        { status: 403 }
      );
    }

    const sellerData = await request.json();

    const requiredFields = ["name", "email", "phone", "address", "businessName", "taxId"];
    const missingFields = requiredFields.filter((field) => !sellerData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const existingSeller = await prisma.seller.findUnique({
      where: { email: sellerData.email },
    });

    if (existingSeller) {
      return NextResponse.json(
        {
          success: false,
          message: "A seller with this email already exists",
        },
        { status: 409 }
      );
    }

    const seller = await prisma.seller.create({
      data: {
        name: sellerData.name,
        email: sellerData.email,
        phone: sellerData.phone,
        address: sellerData.address,
        businessName: sellerData.businessName,
        taxId: sellerData.taxId,
        adminId: adminUser.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Seller created successfully",
        data: {
          id: seller.id,
          businessName: seller.businessName,
          name: seller.name,
          address: seller.address,
          email: seller.email,
          isActive: seller.isActive,
          phone: seller.phone,
          createdAt: seller.createdAt,
          taxId: seller.taxId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating seller:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create seller",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sellerId = url.searchParams.get("id");

    if (!sellerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Seller ID is required",
        },
        { status: 400 }
      );
    }

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
          message: "You don't have permission to update sellers",
        },
        { status: 403 }
      );
    }

    const existingSeller = await prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!existingSeller) {
      return NextResponse.json(
        {
          success: false,
          message: "Seller not found",
        },
        { status: 404 }
      );
    }

    const sellerData = await request.json();

    const requiredFields = ["name", "email", "phone", "address", "businessName", "taxId"];
    const missingFields = requiredFields.filter((field) => !sellerData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check for duplicate email (only if email is changed)
    if (sellerData.email !== existingSeller.email) {
      const emailExists = await prisma.seller.findUnique({
        where: { email: sellerData.email },
      });

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            message: "A seller with this email already exists",
          },
          { status: 409 }
        );
      }
    }

    // Update the seller
    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: {
        name: sellerData.name,
        email: sellerData.email,
        phone: sellerData.phone,
        address: sellerData.address,
        businessName: sellerData.businessName,
        taxId: sellerData.taxId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Seller updated successfully",
        data: {
          id: updatedSeller.id,
          businessName: updatedSeller.businessName,
          name: updatedSeller.name,
          address: updatedSeller.address,
          email: updatedSeller.email,
          isActive: updatedSeller.isActive,
          phone: updatedSeller.phone,
          createdAt: updatedSeller.createdAt,
          taxId: updatedSeller.taxId,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating seller:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update seller",
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
          message: "You don't have permission to delete sellers",
        },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const sellerId = url.searchParams.get("id");

    if (!sellerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Seller ID is required",
        },
        { status: 400 }
      );
    }

    const existingSeller = await prisma.seller.findFirst({
      where: {
        id: sellerId,
        adminId: adminUser.id,
      },
    });

    if (!existingSeller) {
      return NextResponse.json(
        {
          success: false,
          message: "Seller not found or you don't have permission to delete it",
        },
        { status: 404 }
      );
    }

    await prisma.seller.delete({
      where: {
        id: sellerId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Seller deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting seller:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete seller",
      },
      { status: 500 }
    );
  }
}
