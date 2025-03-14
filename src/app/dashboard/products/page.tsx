"use client";

import React, { useState } from "react";
import DashboardProductAdd, { ProductData } from "@/app/dash_components/DashboardProductAdd";

export default function ProductsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddProduct = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
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

      // Make the API call
      const response = await fetch("/dash_api/phone_model_details", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      const result = await response.json();
      console.log("Product saved successfully:", result);

      // Do something with the response (e.g., show success message, update UI)
    } catch (error) {
      console.error("Error saving product:", error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
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
      </div>

      {/* Your products list/table would go here */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Your product listing goes here...</p>
      </div>

      {/* Product Add Dialog */}
      <DashboardProductAdd isOpen={isAddDialogOpen} onClose={handleCloseDialog} onSave={handleSaveProduct} />
    </div>
  );
}
