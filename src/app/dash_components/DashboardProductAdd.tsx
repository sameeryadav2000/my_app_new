"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PhoneModelDetails } from "@/app/dashboard/products/page";

interface PhoneModels {
  phoneModelId: number;
  phoneModel: string;
  phoneId: number;
  bestseller: boolean;
}

export interface ProductData {
  id: number | null;
  phoneType: string;
  model: string;
  modelId: number | null;
  colorId: number | null;
  condition: string;
  storage: string;
  color: string;
  price: number | null;
  available: "yes" | "no";
  createdBy: string;
}

interface DashboardProductAddProps {
  onClose: () => void;
  onSave: (productData: ProductData) => void;
  productToEdit: PhoneModelDetails | null;
}

export default function DashboardProductAdd({ onClose, onSave, productToEdit }: DashboardProductAddProps) {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();
  const [colors, setColors] = useState<{ id: number; color: string }[]>([]);
  const [phoneTypes, setPhoneTypes] = useState<{ id: number; phone_type: string }[]>([]);
  const [phoneModels, setPhoneModels] = useState<PhoneModels[]>([]);
  const { data: session } = useSession();

  const [formData, setFormData] = useState<ProductData>({
    id: null,
    phoneType: "",
    model: "",
    modelId: null,
    colorId: null,
    condition: "",
    storage: "",
    color: "",
    price: null,
    available: "yes",
    createdBy: "",
  });

  useEffect(() => {
    const fetchColors = async () => {
      try {
        showLoading();

        const response = await fetch("/dash_api/colors", {
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

        const colors = result.data;
        setColors(colors);
      } catch (error) {
        showError("Error", "Failed to load colors. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchColors();
  }, []);

  useEffect(() => {
    const fetchPhoneTypes = async () => {
      try {
        showLoading();

        const response = await fetch("/dash_api/phone_type", {
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

        const phone_types = result.data;
        setPhoneTypes(phone_types);
      } catch (error) {
        showError("Error", "Failed to load phone types. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchPhoneTypes();
  }, []);

  useEffect(() => {
    if (formData.phoneType) {
      const fetchModels = async () => {
        try {
          showLoading();

          const response = await fetch(`/dash_api/phone_model?phone_type=${formData.phoneType}`, {
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
          setPhoneModels(phoneModels);
        } catch (error) {
          showError("Error", "Failed to load phone models. Please check your connection and try again.");
        } finally {
          hideLoading();
        }
      };
      fetchModels();
    }
  }, [formData.phoneType]);

  useEffect(() => {
    const userId = session?.user?.id;

    if (userId) {
      setFormData((prev) => ({
        ...prev,
        createdBy: userId,
      }));
    } else {
      showError("Error", "User ID is required. Please log in again.");
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "model") {
      const selectedModel = JSON.parse(value);
      setFormData((prev) => ({
        ...prev,
        model: selectedModel.model,
        modelId: selectedModel.id,
      }));
    } else if (name === "color") {
      const selectedColor = JSON.parse(value);
      setFormData((prev) => ({
        ...prev,
        color: selectedColor.color,
        colorId: selectedColor.id,
      }));
    } else if (name === "price") {
      const priceValue = value === "" ? null : parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        price: priceValue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      ...formData,
    });

    setFormData({
      id: null,
      phoneType: "",
      model: "",
      modelId: null,
      colorId: null,
      condition: "",
      storage: "",
      color: "",
      price: null,
      available: "yes",
      createdBy: "",
    });
    onClose();
  };

  const isFormValid = () => {
    return (
      formData.phoneType.trim() !== "" &&
      formData.model.trim() !== "" &&
      formData.modelId !== null &&
      formData.colorId !== null &&
      formData.condition.trim() !== "" &&
      formData.storage.trim() !== "" &&
      formData.color.trim() !== "" &&
      formData.price !== null &&
      formData.createdBy.trim() !== ""
    );
  };

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        id: productToEdit.id,
        phoneType: productToEdit.phone.phone.phone,
        model: productToEdit.title,
        modelId: productToEdit.phoneId,
        colorId: productToEdit.colorId,
        condition: productToEdit.condition,
        storage: productToEdit.storage,
        color: productToEdit.color.color,
        price: productToEdit.price,
        available: productToEdit.available ? "yes" : "no",
        createdBy: productToEdit.createdBy,
      });
    }
  }, [productToEdit]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-6 overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{productToEdit ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-blue-100 text-sm mt-1">{productToEdit ? "Update product information" : "Create a new product listing"}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 cursor">Phone Type</label>
              <select
                name="phoneType"
                value={formData.phoneType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                required
              >
                <option value="">Select Type</option>
                {isLoading ? (
                  <option value="" disabled>
                    Loading phone types...
                  </option>
                ) : (
                  phoneTypes.map((phoneType) => (
                    <option key={phoneType.id} value={phoneType.phone_type}>
                      {phoneType.phone_type}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Model</label>
              <select
                name="model"
                value={formData.model ? JSON.stringify({ id: formData.modelId, model: formData.model }) : ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                required
              >
                <option value="" disabled>
                  Select Phone Type First
                </option>
                {phoneModels.map((model) => (
                  <option key={model.phoneModelId} value={JSON.stringify({ id: model.phoneModelId, model: model.phoneModel })}>
                    {model.phoneModel}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                required
              >
                <option value="">Select Condition</option>
                <option value="new">New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Storage</label>
              <select
                name="storage"
                value={formData.storage}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                required
              >
                <option value="">Select Storage</option>
                <option value="64">64GB</option>
                <option value="128">128GB</option>
                <option value="256">256GB</option>
                <option value="512">512GB</option>
                <option value="1TB">1TB</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Color</label>
              <select
                name="color"
                value={formData.color ? JSON.stringify({ id: formData.colorId, color: formData.color }) : ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm capitalize"
                required
              >
                <option value="">Select Color</option>
                {isLoading ? (
                  <option value="" disabled>
                    Loading colors...
                  </option>
                ) : (
                  colors.length > 0 &&
                  colors.map((color) => (
                    <option key={color.id} value={JSON.stringify({ id: color.id, color: color.color })}>
                      {color.color}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Price ($)</label>
              <input
                name="price"
                type="number"
                value={formData.price === null ? "" : formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Availability</label>
              <select
                name="available"
                value={formData.available}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                <option value="yes">In Stock</option>
                <option value="no">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-8 py-3 text-sm font-semibold text-white rounded-xl transition-all shadow-md ${
                isFormValid()
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  : "bg-gradient-to-r from-blue-300 to-indigo-300 cursor-not-allowed"
              }`}
              disabled={!isFormValid()}
            >
              {productToEdit ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
