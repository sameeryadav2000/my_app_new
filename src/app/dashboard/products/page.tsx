"use client";

import { FiPlus } from "react-icons/fi";
import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import React, { useState, useEffect } from "react";
import ProductDialog, { ProductData } from "@/app/dash_components/ProductDialog";
import DashboardProductCard from "@/app/dash_components/ProductCard";

export interface Color {
  id: number;
  color: string;
}

export interface Phone {
  id: number;
  phone: string;
}

export interface ModelImage {
  id: number;
  image: string;
  colorId: number;
  phoneId: number;
  mainImage: number;
}

export interface Product {
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
  sellerId: string;
}

export default function ProductsPage() {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

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

  const handleEditProduct = (id: string) => {
    const productToEdit = products.find((product) => product.id === id);
    if (productToEdit) {
      openDialog(true, productToEdit);
    }
  };

  const openDialog = (editMode = false, product: Product | null = null) => {
    setIsEditMode(editMode);
    setCurrentProduct(product);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Products</h1>

        <button
          onClick={() => openDialog()}
          className="flex items-center px-4 py-2.5 bg-black text-white rounded-md hover:bg-[#333333] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#555555] focus:ring-offset-2"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          <span>Add Product</span>
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

      {isDialogOpen && <ProductDialog onClose={closeDialog} onSave={handleSaveProduct} productToEdit={currentProduct} />}
    </div>
  );
}
