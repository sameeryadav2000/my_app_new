"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PhoneModelDetails } from "@/app/dashboard/products/page";

export interface ProductData {
  phoneType: "iPhone" | "Samsung" | "Google" | "OnePlus" | "Huawei" | "Other" | "";
  model: string;
  modelId: number | null;
  colorId: number | null;
  condition: "new" | "excellent" | "good" | "fair" | "";
  storage: "64" | "128" | "256" | "512" | "1TB" | "";
  color: string;
  price: number | string;
  available: "yes" | "no";
  images: File[];
  createdBy: string;
}

interface DashboardProductAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: ProductData) => void;
  productToEdit?: PhoneModelDetails | null;
}

export default function DashboardProductAdd({ isOpen, onClose, onSave, productToEdit }: DashboardProductAddProps) {
  const [phoneModels, setPhoneModels] = useState<{ id: number; name: string }[]>([]);
  const [colors, setColors] = useState<{ id: number; color: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session } = useSession();
  const [userError, setUserError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductData>({
    phoneType: "",
    model: "",
    modelId: null,
    colorId: null,
    condition: "",
    storage: "",
    color: "",
    price: "",
    available: "yes",
    images: [],
    createdBy: "",
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "model") {
      const selectedModel = JSON.parse(value);
      setFormData((prev) => ({
        ...prev,
        model: selectedModel.name,
        modelId: selectedModel.id,
      }));
    } else if (name === "color") {
      setFormData((prev) => ({
        ...prev,
        color: value,
        colorId: JSON.parse(value).id,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));

      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedColor = formData.color ? JSON.parse(formData.color).color : "";

    onSave({
      ...formData,
      color: selectedColor,
      price: parseFloat(formData.price as string),
    });

    setFormData({
      phoneType: "",
      model: "",
      modelId: null,
      colorId: null,
      condition: "",
      storage: "",
      color: "",
      price: "",
      available: "yes",
      images: [],
      createdBy: "",
    });
    setImagePreviews([]);
    setExistingImages([]);
    onClose();
  };

  useEffect(() => {
    if (formData.phoneType) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/dash_api/phone?type=${formData.phoneType}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            setPhoneModels([]);
            throw new Error("Failed to fetch phone details");
          }

          const data = await response.json();
          setPhoneModels(data.models);
        } catch (error) {
          console.error("Error fetching phone details:", error);
        }
      };

      fetchData();
    }
  }, [formData.phoneType]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const fetchColors = async () => {
        try {
          const response = await fetch("/dash_api/colors", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            setColors([]);
            throw new Error("Failed to fetch colors");
          }

          const data = await response.json();
          setColors(Array.isArray(data.colors) ? data.colors : []);
        } catch (error) {
          console.error("Error fetching colors:", error);
          setColors([]);
        } finally {
          setLoading(false);
        }
      };

      fetchColors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (session) {
      const userId = (session as any).user?.id || "";

      setFormData((prev) => ({
        ...prev,
        createdBy: userId,
      }));
      setUserError(userId ? null : "Unable to retrieve user ID. Please log in again.");
    } else {
      console.warn("User ID is undefined or not a string in session");
      setUserError("Unable to retrieve user ID. Please log in again.");
      setFormData((prev) => ({
        ...prev,
        createdBy: "",
      }));
    }
  }, [session]);

  // Populate form data when editing a product
  useEffect(() => {
    if (productToEdit && isOpen) {
      // Determine phone type from phone model name
      const getPhoneType = (model: string): "iPhone" | "Samsung" | "Google" | "OnePlus" | "Huawei" | "Other" => {
        if (model.includes("iPhone")) return "iPhone";
        if (model.includes("Samsung") || model.includes("Galaxy")) return "Samsung";
        if (model.includes("Pixel") || model.includes("Google")) return "Google";
        if (model.includes("OnePlus")) return "OnePlus";
        if (model.includes("Huawei")) return "Huawei";
        return "Other";
      };

      const phoneType = getPhoneType(productToEdit.phone.model);

      // Set form data from the product to edit
      setFormData({
        phoneType: phoneType,
        model: productToEdit.title,
        modelId: productToEdit.phoneId,
        colorId: productToEdit.colorId,
        condition: productToEdit.condition as any,
        storage: productToEdit.storage as any,
        color: JSON.stringify({ id: productToEdit.colorId, color: productToEdit.color.color }),
        price: productToEdit.price.toString(),
        available: productToEdit.available ? "yes" : "no",
        images: [],
        createdBy: productToEdit.createdBy,
      });

      // If there are existing images, display them
      if (productToEdit.images && productToEdit.images.length > 0) {
        const imageUrls = productToEdit.images.map((img) => img.image);
        setExistingImages(imageUrls);
      }
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

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
          {userError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
              <strong>Error:</strong> {userError}
            </div>
          )}

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
                <option value="iPhone">iPhone</option>
                <option value="Samsung">Samsung</option>
                <option value="Google">Google</option>
                <option value="OnePlus">OnePlus</option>
                <option value="Huawei">Huawei</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Model</label>
              <select
                name="model"
                value={formData.model ? JSON.stringify({ id: formData.modelId, name: formData.model }) : ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                required
              >
                <option value="" disabled>
                  Select Phone Type
                </option>
                {phoneModels.map((model) => (
                  <option key={model.id} value={JSON.stringify({ id: model.id, name: model.name })}>
                    {model.name}
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
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                required
              >
                <option value="">Select Color</option>
                {loading ? (
                  <option value="" disabled>
                    Loading colors...
                  </option>
                ) : colors.length > 0 ? (
                  colors.map((color) => (
                    <option key={color.id} value={JSON.stringify({ id: color.id, color: color.color })}>
                      {color.color}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No colors available
                  </option>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Price ($)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
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

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-800">Product Images</label>
              {existingImages.length > 0 && (
                <span className="text-sm text-gray-500">
                  {existingImages.length} existing image{existingImages.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img
                        src={image}
                        alt={`Product ${index}`}
                        className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-200"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{productToEdit ? "Upload new images to replace these." : ""}</p>
              </div>
            )}

            {/* Upload new images */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                {productToEdit ? "Upload New Images" : "Upload Images"}
              </label>
              <p className="text-sm text-gray-500 mt-2">Supports multiple images (JPG, PNG)</p>
            </div>

            {/* New image previews */}
            {imagePreviews.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">New Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-lg shadow-sm" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
              disabled={!!userError || !formData.createdBy}
            >
              {productToEdit ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
