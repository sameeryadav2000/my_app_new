"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState } from "react";
import OrderSummary from "@/app/components/OrderSummary";

export interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

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

export default function ShippingPage() {
  const { showLoading, hideLoading } = useLoading();
  const { showSuccess, showError } = useNotification();

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

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savedShippingInfo, setSavedShippingInfo] = useState<ShippingData | null>(null);

  // Fetch shipping info on component mount
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchShippingInfo = async () => {
      showLoading();

      try {
        const storedShippingInfo = sessionStorage.getItem("shippingInfo");

        if (storedShippingInfo) {
          const parsedInfo = JSON.parse(storedShippingInfo);
          setSavedShippingInfo(parsedInfo);
          hideLoading();
          return;
        }

        const response = await fetch("/api/shipping", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal,
        });

        const result = await response.json();

        if (!result.success) {
          showError("Error", result.message);
          return;
        }

        setSavedShippingInfo(result.shippingInfo);
        sessionStorage.setItem("shippingInfo", JSON.stringify(result.shippingInfo));
      } catch (error) {
        showError("Error", "Failed to fetch shipping info. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchShippingInfo();

    return () => {
      abortController.abort();
    };
  }, []);

  // Set form data when editing existing shipping info
  useEffect(() => {
    if (isEditing && savedShippingInfo) {
      setShippingInfo(savedShippingInfo);
    }
  }, [isEditing, savedShippingInfo]);

  // Validate form on data change
  useEffect(() => {
    validateForm();
  }, [shippingInfo]);

  const validateForm = () => {
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
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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

    validateForm();

    if (!isFormValid) {
      setIsSubmitting(false);
      showError("Validation Error", "Please correct the errors in the form before submitting.");
      return;
    }

    try {
      showLoading();

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
      setSavedShippingInfo(result.shippingInfo);
      sessionStorage.setItem("shippingInfo", JSON.stringify(result.shippingInfo));
      setIsEditing(false);
    } catch (error) {
      showError("Error", "Error saving shipping information. Please check your connection and try again.");
    } finally {
      hideLoading();
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between w-4/5 mx-auto gap-8">
      <div className="flex items-center justify-between mb-6 md:hidden">
        <h1 className="text-2xl font-bold text-black">Shipping Information</h1>
      </div>

      <div className="md:w-[70%]">
        <div className="bg-white border border-[#e0e0e0] rounded-xl shadow-md p-6 transition-all">
          <div className="flex items-center justify-between mb-8 hidden md:flex">
            <h1 className="text-2xl font-bold text-black">Shipping Information</h1>
          </div>

          {savedShippingInfo && !isEditing ? (
            <div className="mt-4">
              <div className="border border-[#e0e0e0] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-black text-white px-5 py-3">
                  <h3 className="font-medium">Delivery Address</h3>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-black">
                            {savedShippingInfo.firstName} {savedShippingInfo.lastName}
                          </p>
                          <p className="text-[#666666] text-sm">{savedShippingInfo.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[#666666]">
                            {savedShippingInfo.address},<br />
                            {savedShippingInfo.city}, {savedShippingInfo.state} {savedShippingInfo.zipCode}
                          </p>
                          <p className="text-[#666666] text-sm mt-1">{savedShippingInfo.email}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleEdit}
                      className="flex items-center text-sm font-medium text-black border border-[#e0e0e0] px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-7">
              {isEditing ? (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border-l-4 border-black">
                  <p className="text-lg font-medium text-black">Editing Shipping Information</p>
                  <p className="text-sm text-[#666666] mt-1">Make your changes and save when you're ready</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border-l-4 border-black">
                  <p className="text-lg font-medium text-black">Add Shipping Information</p>
                  <p className="text-sm text-[#666666] mt-1">Please fill in the details below to continue</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={shippingInfo.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      touched.firstName && errors.firstName ? "border-red-500" : "border-[#e0e0e0]"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200`}
                    placeholder="Enter your first name"
                    required
                  />
                  {touched.firstName && errors.firstName && <p className="text-sm text-red-500 mt-2">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={shippingInfo.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      touched.lastName && errors.lastName ? "border-red-500" : "border-[#e0e0e0]"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200`}
                    placeholder="Enter your last name"
                    required
                  />
                  {touched.lastName && errors.lastName && <p className="text-sm text-red-500 mt-2">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      touched.email && errors.email ? "border-red-500" : "border-[#e0e0e0]"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200`}
                    placeholder="example@email.com"
                    required
                  />
                  {touched.email && errors.email && <p className="text-sm text-red-500 mt-2">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      touched.phone && errors.phone ? "border-red-500" : "border-[#e0e0e0]"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200`}
                    placeholder="Enter numbers only"
                    required
                  />
                  {touched.phone && errors.phone && <p className="text-sm text-red-500 mt-2">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    touched.address && errors.address ? "border-red-500" : "border-[#e0e0e0]"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200`}
                  placeholder="Enter your street address"
                  required
                />
                {touched.address && errors.address && <p className="text-sm text-red-500 mt-2">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      touched.city && errors.city ? "border-red-500" : "border-[#e0e0e0]"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200`}
                    placeholder="Enter your city"
                    required
                  />
                  {touched.city && errors.city && <p className="text-sm text-red-500 mt-2">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">State/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      touched.state && errors.state ? "border-red-500" : "border-[#e0e0e0]"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200`}
                    placeholder="Enter your state"
                    required
                  />
                  {touched.state && errors.state && <p className="text-sm text-red-500 mt-2">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      touched.zipCode && errors.zipCode ? "border-red-500" : "border-[#e0e0e0]"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200`}
                    placeholder="Enter your ZIP code"
                    required
                  />
                  {touched.zipCode && errors.zipCode && <p className="text-sm text-red-500 mt-2">{errors.zipCode}</p>}
                </div>
              </div>

              <div className="flex gap-4 pt-6 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-5 py-3.5 bg-black text-white rounded-xl hover:bg-[#333333] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#555555] focus:ring-offset-2 shadow-md ${
                    isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save and Continue to Payment"
                  )}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-3.5 bg-white text-[#666666] border border-[#e0e0e0] rounded-xl hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#e0e0e0] focus:ring-offset-2 shadow-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      <OrderSummary currentPage="shipping_page" shippingInfoComplete={!!savedShippingInfo} />
    </div>
  );
}
