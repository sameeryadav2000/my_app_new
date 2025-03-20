"use client";

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

export interface SellerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  businessName: string;
  taxId: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  businessName?: string;
  taxId?: string;
}

interface TouchedFields {
  name: boolean;
  email: boolean;
  phone: boolean;
  address: boolean;
  businessName: boolean;
  taxId: boolean;
}

interface SellerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (seller: SellerData) => void;
  sellerToEdit?: SellerData | null;
}

export default function SellerDialog({ isOpen, onClose, onSave, sellerToEdit }: SellerDialogProps) {
  const [formData, setFormData] = useState<SellerData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
    taxId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    email: false,
    phone: false,
    address: false,
    businessName: false,
    taxId: false,
  });

  useEffect(() => {
    if (sellerToEdit) {
      setFormData({
        name: sellerToEdit.name,
        email: sellerToEdit.email,
        phone: sellerToEdit.phone,
        address: sellerToEdit.address,
        businessName: sellerToEdit.businessName,
        taxId: sellerToEdit.taxId,
      });
    }
  }, [sellerToEdit]);

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

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Phone must contain only numbers";
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    // Validate business name
    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.taxId.trim()) {
      newErrors.taxId = "Tax ID is required";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // For phone field, only allow numeric input
    if (name === "phone" && value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    // Mark field as touched when user changes its value
    if (!touched[name as keyof TouchedFields]) {
      setTouched({
        ...touched,
        [name]: true,
      });
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched on submit
    const allTouched: TouchedFields = {
      name: true,
      email: true,
      phone: true,
      address: true,
      businessName: true,
      taxId: true,
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
            <h2 className="text-2xl font-bold text-white">{sellerToEdit ? "Edit Seller" : "Add New Seller"}</h2>
            <p className="text-gray-300 text-sm mt-1">{sellerToEdit ? "Update seller information" : "Create a new seller profile"}</p>
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
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  touched.name && errors.name ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
                placeholder="Enter seller's full name"
              />
              {touched.name && errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  touched.email && errors.email ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
                placeholder="example@email.com"
              />
              {touched.email && errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-800">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  touched.phone && errors.phone ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
                placeholder="Enter numbers only"
              />
              {touched.phone && errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Business Name */}
            <div className="space-y-2">
              <label htmlFor="businessName" className="block text-sm font-semibold text-gray-800">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  touched.businessName && errors.businessName ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
                placeholder="Enter business name"
              />
              {touched.businessName && errors.businessName && <p className="text-sm text-red-500">{errors.businessName}</p>}
            </div>

            {/* Tax ID */}
            <div className="space-y-2">
              <label htmlFor="taxId" className="block text-sm font-semibold text-gray-800">
                Tax ID / Business Number *
              </label>
              <input
                type="text"
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  touched.taxId && errors.taxId ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
                placeholder="Enter tax ID or business number"
              />
              {touched.taxId && errors.taxId && <p className="text-sm text-red-500">{errors.taxId}</p>}
            </div>

            {/* Address - spans two columns */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="address" className="block text-sm font-semibold text-gray-800">
                Address *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-3 border ${
                  touched.address && errors.address ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm`}
                placeholder="Enter full address"
              />
              {touched.address && errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>
          </div>

          {/* Action buttons */}
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
              disabled={!isFormValid}
              className={`px-8 py-3 text-sm font-semibold text-white rounded-xl transition-all shadow-md ${
                isFormValid ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {sellerToEdit ? "Update Seller" : "Save Seller"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
