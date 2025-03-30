"use client";

import { useState, useEffect, useCallback } from "react";
import { useNotification } from "@/context/NotificationContext";
import { useLoading } from "@/context/LoadingContext";
import { ShippingData } from "@/app/homepage/account/page";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface TouchedFields {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  phone: boolean;
  address: boolean;
  city: boolean;
  state: boolean;
  zipCode: boolean;
}

interface ShippingInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (shippingInfo: ShippingData) => void;
  initialData: ShippingData | null;
}

export default function ShippingInfoDialog({ isOpen, onClose, onSuccess, initialData }: ShippingInfoDialogProps) {
  const { showError, showSuccess } = useNotification();
  const { showLoading, hideLoading, isLoading } = useLoading();

  const [shippingInfo, setShippingInfo] = useState<ShippingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [touched, setTouched] = useState<TouchedFields>({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    address: false,
    city: false,
    state: false,
    zipCode: false,
  });

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setShippingInfo(initialData);
    }
  }, [initialData]);

  // Earlier in your component...

  // Use useCallback to memoize the validateForm function
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};

    // Validate first name
    if (!shippingInfo.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Validate last name
    if (!shippingInfo.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Validate email
    if (!shippingInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = "Invalid email format";
    }

    // Validate phone
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d+$/.test(shippingInfo.phone)) {
      newErrors.phone = "Phone must contain only numbers";
    }

    // Validate address
    if (!shippingInfo.address.trim()) {
      newErrors.address = "Address is required";
    }

    // Validate city
    if (!shippingInfo.city.trim()) {
      newErrors.city = "City is required";
    }

    // Validate state
    if (!shippingInfo.state.trim()) {
      newErrors.state = "State is required";
    }

    // Validate zipCode
    if (!shippingInfo.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [shippingInfo]); // Include shippingInfo in the dependency array

  // Update the useEffect to depend on validateForm
  useEffect(() => {
    validateForm();
  }, [validateForm]); // Include validateForm in the dependency array

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    setShippingInfo({
      ...shippingInfo,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched on submit
    const allTouched: TouchedFields = {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
    };
    setTouched(allTouched);

    if (!isFormValid) {
      showError("Validation Error", "Please correct the errors in the form before submitting.");
      return;
    }

    showLoading();

    try {
      const response = await fetch("/api/shipping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...shippingInfo,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        showError("Error", result.message);
        return;
      }

      showSuccess("Success", result.message || "Shipping information saved successfully");
      onSuccess(result.shippingInfo);
    } catch (error) {
      console.error("Error saving shipping information: ", error);
      showError("Error", "Error saving shipping information. Please check your connection and try again.");
    } finally {
      hideLoading();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-6 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-black p-4 sm:p-5 md:p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-xl md:text-2xl font-bold text-white">Shipping Information</h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                {initialData ? "Edit your shipping details" : "Add your shipping details"}
              </p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors" disabled={isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="firstName" className="block text-xs sm:text-sm font-semibold text-gray-800">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={shippingInfo.firstName}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                  touched.firstName && errors.firstName ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
                placeholder="Enter your first name"
                disabled={isLoading}
              />
              {touched.firstName && errors.firstName && <p className="text-xs sm:text-sm text-red-500">{errors.firstName}</p>}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="lastName" className="block text-xs sm:text-sm font-semibold text-gray-800">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={shippingInfo.lastName}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                  touched.lastName && errors.lastName ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
                placeholder="Enter your last name"
                disabled={isLoading}
              />
              {touched.lastName && errors.lastName && <p className="text-xs sm:text-sm text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-800">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={shippingInfo.email}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                  touched.email && errors.email ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
                placeholder="example@email.com"
                disabled={isLoading}
              />
              {touched.email && errors.email && <p className="text-xs sm:text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-gray-800">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={shippingInfo.phone}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                  touched.phone && errors.phone ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
                placeholder="Enter numbers only"
                disabled={isLoading}
              />
              {touched.phone && errors.phone && <p className="text-xs sm:text-sm text-red-500">{errors.phone}</p>}
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="address" className="block text-xs sm:text-sm font-semibold text-gray-800">
              Street Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={shippingInfo.address}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                touched.address && errors.address ? "border-red-500" : "border-gray-200"
              } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
              placeholder="Enter your street address"
              disabled={isLoading}
            />
            {touched.address && errors.address && <p className="text-xs sm:text-sm text-red-500">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="city" className="block text-xs sm:text-sm font-semibold text-gray-800">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={shippingInfo.city}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                  touched.city && errors.city ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
                placeholder="Enter your city"
                disabled={isLoading}
              />
              {touched.city && errors.city && <p className="text-xs sm:text-sm text-red-500">{errors.city}</p>}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="state" className="block text-xs sm:text-sm font-semibold text-gray-800">
                State/Province *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={shippingInfo.state}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                  touched.state && errors.state ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
                placeholder="Enter your state"
                disabled={isLoading}
              />
              {touched.state && errors.state && <p className="text-xs sm:text-sm text-red-500">{errors.state}</p>}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="zipCode" className="block text-xs sm:text-sm font-semibold text-gray-800">
                ZIP Code *
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={shippingInfo.zipCode}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                  touched.zipCode && errors.zipCode ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
                placeholder="Enter your ZIP code"
                disabled={isLoading}
              />
              {touched.zipCode && errors.zipCode && <p className="text-xs sm:text-sm text-red-500">{errors.zipCode}</p>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white rounded-xl transition-all shadow-md ${
                isFormValid && !isLoading ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Saving..." : "Save Shipping Information"}
            </button>
          </div>

          {/* Cancel option */}
          <div className="text-center pt-3">
            <button type="button" onClick={onClose} disabled={isLoading} className="text-xs sm:text-sm text-black hover:underline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
