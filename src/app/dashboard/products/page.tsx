"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import React, { useState, useEffect } from "react";
import DashboardProductAdd, { ProductData } from "@/app/dash_components/DashboardProductAdd";
import DashboardProductCard from "@/app/dash_components/DashboardProductCard";

export interface Color {
  id: number;
  color: string;
}

export interface Phone {
  id: number;
  phone: string;
}

export interface PhoneModel {
  id: number;
  model: string;
  phoneId: number;
  bestseller: boolean;
  phone: Phone;
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
  storage: string;
  available: boolean;
  color: Color;
  colorId: number;
  condition: string;
  createdBy: string;
  phone: PhoneModel;
  price: number;
  purchased: boolean;
  images: ModelImage[];
}

export default function ProductsPage() {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<PhoneModelDetails[]>([]);
  const [currentProduct, setCurrentProduct] = useState<PhoneModelDetails | null>(null);

  const fetchProducts = async () => {
    try {
      showLoading();

      const response = await fetch("/dash_api/phone_model_details", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!result.success) {
        showError("Error", result.message);
        return;
      }

      const phoneModels = result.data;
      setProducts(phoneModels);
    } catch (error) {
      showError("Error", "Failed to load phone models. Please check your connection and try again.");
    } finally {
      hideLoading();
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
      showLoading();

      const formData = new FormData();

      if (productData.id !== null) {
        formData.append("id", productData.id.toString());
      }

      formData.append("title", productData.model);
      formData.append("condition", productData.condition);
      formData.append("storage", productData.storage);
      formData.append("available", productData.available);
      formData.append("createdBy", productData.createdBy);

      if (productData.price !== null) {
        formData.append("price", productData.price.toString());
      }

      if (productData.modelId !== null) {
        formData.append("phoneId", productData.modelId.toString());
      }

      if (productData.colorId !== null) {
        formData.append("colorId", productData.colorId.toString());
      }

      let url = "/dash_api/phone_model_details";

      const method = productData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        showError("Error", result.message);
        return;
      }

      showSuccess(
        productData.id ? "Product Updated" : "Product Added",
        productData.id
          ? `The product ${productData.model} has been successfully updated.`
          : `The product ${productData.model} has been successfully added.`
      );

      fetchProducts();
    } catch (error) {
      showError("Error", "Error saving phone model detail: Please check your connection and try again.");
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Products</h1>
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

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-6 flex justify-center">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <DashboardProductCard key={product.id} product={product} onEdit={handleEditProduct} />
            ))}
          </div>
        </div>
      )}

      {isAddDialogOpen && <DashboardProductAdd onClose={handleCloseDialog} onSave={handleSaveProduct} productToEdit={currentProduct} />}
    </div>
  );
}
