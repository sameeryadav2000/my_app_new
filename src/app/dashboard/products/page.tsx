"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardProductAdd, { ProductData } from "@/app/dash_components/DashboardProductAdd";
import DashboardProductCard from "@/app/dash_components/DashboardProductCard";

export interface Color {
  id: number;
  color: string;
}

export interface Phone {
  id: number;
  model: string;
  phoneId: number;
  bestseller: boolean;
  price?: number;
}

export interface ModelImage {
  id: number;
  image: string;
  colorId: number;
  phoneId: number;
}

export interface PhoneModelDetails {
  id: number;
  title: string;
  phoneId: number;
  available: boolean;
  color: Color;
  colorId: number;
  condition: string;
  createdBy: string;
  phone: Phone;
  price: number;
  storage: string;
  images: ModelImage[];
}

export default function ProductsPage() {
  const { data: session } = useSession();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [products, setProducts] = useState<PhoneModelDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentProduct, setCurrentProduct] = useState<PhoneModelDetails | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/dash_api/phone_model_details");

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditProduct = (product: PhoneModelDetails) => {
    setCurrentProduct(product);
    setIsAddDialogOpen(true);
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setCurrentProduct(null);
  };

  const handleSaveProduct = async (productData: ProductData) => {
    try {
      // Create FormData object to handle both text and file data
      const formData = new FormData();

      // Add all the text fields
      formData.append("phoneType", productData.phoneType);
      formData.append("model", productData.model);
      formData.append("condition", productData.condition);
      formData.append("storage", productData.storage);
      formData.append("color", productData.color);
      formData.append("price", productData.price.toString());
      formData.append("available", productData.available);

      // Add the IDs that are already in your form state
      if (productData.modelId) {
        formData.append("phoneId", productData.modelId.toString());
      }

      if (productData.colorId) {
        formData.append("colorId", productData.colorId.toString());
      }

      // Add user ID from the createdBy field
      formData.append("userId", productData.createdBy);

      // Add all image files
      productData.images.forEach((image) => {
        formData.append("images", image);
      });

      // Determine the right API endpoint and method based on whether we're editing or creating
      const url = currentProduct ? `/dash_api/phone_model_details/${currentProduct.id}` : "/dash_api/phone_model_details";

      const method = currentProduct ? "PUT" : "POST";

      // Make the API call
      const response = await fetch(url, {
        method: method,
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      const result = await response.json();
      console.log("Product saved successfully:", result);

      fetchProducts();

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving product:", error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        {session && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center"
            onClick={handleAddProduct}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Product
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 flex justify-center">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <DashboardProductCard key={product.id} product={product} onEdit={handleEditProduct} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No products found. Add a product to get started.</p>
          )}
        </div>
      )}

      <DashboardProductAdd isOpen={isAddDialogOpen} onClose={handleCloseDialog} onSave={handleSaveProduct} productToEdit={currentProduct} />
    </div>
  );
}
