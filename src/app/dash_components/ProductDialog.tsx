"use client";

import { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";

export interface ProductData {
  phoneType: string;
  modelId: string;
  condition: string;
  storage: string;
  color: string;
  price: string;
  availability: string;
  sellerId: string;
}

interface FormErrors {
  phoneType?: string;
  modelId?: string;
  condition?: string;
  storage?: string;
  color?: string;
  price?: string;
  availability?: string;
  sellerId?: string;
}

interface TouchedFields {
  phoneType: boolean;
  modelId: boolean;
  condition: boolean;
  storage: boolean;
  color: boolean;
  price: boolean;
  availability: boolean;
  sellerId: boolean;
}

interface Seller {
  id: string;
  businessName: string;
  name: string;
  email: string;
  phone: string;
  taxId: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductData) => void;
  productToEdit: ProductData | null;
}

export default function ProductDialog({ isOpen, onClose, onSave, productToEdit }: ProductDialogProps) {
  const [formData, setFormData] = useState<ProductData>({
    phoneType: "",
    modelId: "",
    condition: "",
    storage: "",
    color: "",
    price: "",
    availability: "",
    sellerId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [touched, setTouched] = useState<TouchedFields>({
    phoneType: false,
    modelId: false,
    condition: false,
    storage: false,
    color: false,
    price: false,
    availability: false,
    sellerId: false,
  });

  // States for API data
  const [phoneTypes, setPhoneTypes] = useState<{ id: number; phone_type: string }[]>([]);
  const [models, setModels] = useState<{ id: number; model: string; phoneId: number }[]>([]);
  const [colors, setColors] = useState<{ id: number; color: string }[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  // Use the provided context hooks
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();

  // Condition options (static)
  const conditionOptions = ["New", "Excellent", "Good", "Fair"];

  // Storage options (static)
  const storageOptions = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];

  // Availability options (static)
  const availabilityOptions = ["In Stock", "Out of Stock"];

  // Fetch phone types from API
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

        const phoneTypeData = result.data;
        setPhoneTypes(phoneTypeData);
      } catch (error) {
        showError("Error", "Failed to load phone types. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchPhoneTypes();
  }, []);

  // Fetch models based on selected phone type
  useEffect(() => {
    const fetchModels = async () => {
      if (!formData.phoneType) {
        setModels([]);
        return;
      }

      try {
        showLoading();

        // We're sending the phone type ID to get models that belong to this phone type
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

        // Set models with the expected structure from your API
        const modelData = result.data;
        setModels(modelData);
      } catch (error) {
        showError("Error", "Failed to load models. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchModels();
  }, [formData.phoneType]);

  // Fetch colors from API
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

        const colorData = result.data;
        setColors(colorData);
      } catch (error) {
        showError("Error", "Failed to load colors. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchColors();
  }, []);

  // Fetch sellers from API
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        showLoading();

        const response = await fetch("/dash_api/sellers", {
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

        // Set sellers with the expected structure
        const sellerData = result.data;
        setSellers(sellerData);
      } catch (error) {
        showError("Error", "Failed to load sellers. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchSellers();
  }, []);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        phoneType: productToEdit.phoneType,
        modelId: productToEdit.modelId || "",
        condition: productToEdit.condition,
        storage: productToEdit.storage,
        color: productToEdit.color,
        price: productToEdit.price,
        availability: productToEdit.availability,
        sellerId: productToEdit.sellerId,
      });
    }
  }, [productToEdit]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

  // Prevent scrolling of background when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Validate form on data change
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Validate phone type
    if (!formData.phoneType) {
      newErrors.phoneType = "Phone type is required";
    }

    // Validate model
    if (!formData.modelId) {
      newErrors.modelId = "Model is required";
    }

    // Validate condition
    if (!formData.condition) {
      newErrors.condition = "Condition is required";
    }

    // Validate storage
    if (!formData.storage) {
      newErrors.storage = "Storage capacity is required";
    }

    // Validate color
    if (!formData.color) {
      newErrors.color = "Color is required";
    }

    // Validate price
    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    // Validate availability
    if (!formData.availability) {
      newErrors.availability = "Availability status is required";
    }

    // Validate seller
    if (!formData.sellerId) {
      newErrors.sellerId = "Seller is required";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // For price field, only allow numeric input and decimals
    if (name === "price" && value !== "" && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    // Mark field as touched when user changes its value
    if (!touched[name as keyof TouchedFields]) {
      setTouched({
        ...touched,
        [name]: true,
      });
    }

    // Special handling for phoneType to reset model if phone type changes
    if (name === "phoneType" && formData.phoneType !== value) {
      setFormData({
        ...formData,
        [name]: value,
        modelId: "", // Reset model when phone type changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const allTouched: TouchedFields = {
      phoneType: true,
      modelId: true,
      condition: true,
      storage: true,
      color: true,
      price: true,
      availability: true,
      sellerId: true,
    };
    setTouched(allTouched);

    validateForm();

    if (isFormValid) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-md">
      {/* Dialog */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-6 overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-black p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{productToEdit ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-gray-300 text-sm mt-1">{productToEdit ? "Update product information" : "Create a new product listing"}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seller Field */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="sellerId" className="block text-sm font-semibold text-gray-800">
                Seller *
              </label>
              <select
                id="sellerId"
                name="sellerId"
                value={formData.sellerId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  touched.sellerId && errors.sellerId ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
                disabled={isLoading}
              >
                <option value="">Select seller</option>
                {sellers
                  .filter((seller) => seller.isActive)
                  .map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.businessName} ({seller.name})
                    </option>
                  ))}
              </select>
              {touched.sellerId && errors.sellerId && <p className="text-sm text-red-500">{errors.sellerId}</p>}
            </div>

            {/* Phone Type */}
            <div className="space-y-2">
              <label htmlFor="phoneType" className="block text-sm font-semibold text-gray-800">
                Phone Type *
              </label>
              <select
                id="phoneType"
                name="phoneType"
                value={formData.phoneType}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  touched.phoneType && errors.phoneType ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
                disabled={isLoading}
              >
                <option value="">Select phone type</option>
                {phoneTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.phone_type}
                  </option>
                ))}
              </select>
              {touched.phoneType && errors.phoneType && <p className="text-sm text-red-500">{errors.phoneType}</p>}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <label htmlFor="modelId" className="block text-sm font-semibold text-gray-800">
                Model *
              </label>
              <select
                id="modelId"
                name="modelId"
                value={formData.modelId}
                onChange={handleChange}
                disabled={!formData.phoneType || isLoading}
                className={`w-full px-4 py-3 border ${
                  touched.modelId && errors.modelId ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm ${
                  !formData.phoneType ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Select model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.model}
                  </option>
                ))}
              </select>
              {touched.modelId && errors.modelId && <p className="text-sm text-red-500">{errors.modelId}</p>}
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <label htmlFor="condition" className="block text-sm font-semibold text-gray-800">
                Condition *
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  touched.condition && errors.condition ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
              >
                <option value="">Select condition</option>
                {conditionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {touched.condition && errors.condition && <p className="text-sm text-red-500">{errors.condition}</p>}
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <label htmlFor="storage" className="block text-sm font-semibold text-gray-800">
                Storage *
              </label>
              <select
                id="storage"
                name="storage"
                value={formData.storage}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  touched.storage && errors.storage ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
              >
                <option value="">Select storage capacity</option>
                {storageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {touched.storage && errors.storage && <p className="text-sm text-red-500">{errors.storage}</p>}
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label htmlFor="color" className="block text-sm font-semibold text-gray-800">
                Color *
              </label>
              <select
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  touched.color && errors.color ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
                disabled={isLoading}
              >
                <option value="">Select color</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.color}
                  </option>
                ))}
              </select>
              {touched.color && errors.color && <p className="text-sm text-red-500">{errors.color}</p>}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-semibold text-gray-800">
                Price ($) *
              </label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  touched.price && errors.price ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
                placeholder="Enter price"
              />
              {touched.price && errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <label htmlFor="availability" className="block text-sm font-semibold text-gray-800">
                Availability *
              </label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  touched.availability && errors.availability ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
              >
                <option value="">Select availability</option>
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {touched.availability && errors.availability && <p className="text-sm text-red-500">{errors.availability}</p>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all shadow-sm"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`px-8 py-3 text-sm font-semibold text-white rounded-xl transition-all shadow-md ${
                isFormValid && !isLoading ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Processing..." : productToEdit ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
