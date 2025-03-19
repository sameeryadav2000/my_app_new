// src/app/homepage/shipping_page/page.tsx
"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState } from "react";
import OrderSummary from "@/app/components/OrderSummary";

export interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function ShippingPage() {
  const { showLoading, hideLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();

  const [savedShippingInfo, setSavedShippingInfo] = useState<ShippingForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shippingInfo, setShippingInfo] = useState<ShippingForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

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

        showSuccess("Success", "Shipping Info Saved Successfully");

        setSavedShippingInfo(result.shippingInfo);
        sessionStorage.setItem("shippingInfo", JSON.stringify(result.shippingInfo));
      } catch (error) {
        showError("Error", "Failed to fetch shipping info. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchShippingInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

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

      showSuccess("Success", result.message);
      setSavedShippingInfo(result.shippingInfo);
      sessionStorage.setItem("shippingInfo", JSON.stringify(result.shippingInfo));
      setIsEditing(false);
    } catch (error) {
      showError("Error", "Error saving shipping information. Please check your connection and try again.");
    } finally {
      hideLoading();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between w-4/5 mx-auto gap-8">
      <div className="md:w-[70%] p-5">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Shipping Information</h2>
        </div>

        {savedShippingInfo && !isEditing ? (
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl mx-auto space-y-5">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
              <p className="text-gray-800">
                <strong className="font-semibold text-purple-700">Name:</strong> {savedShippingInfo.firstName} {savedShippingInfo.lastName}
              </p>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
              <p className="text-gray-800">
                <strong className="font-semibold text-purple-700">Email:</strong> {savedShippingInfo.email}
              </p>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
              <p className="text-gray-800">
                <strong className="font-semibold text-purple-700">Phone:</strong> {savedShippingInfo.phone}
              </p>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
              <p className="text-gray-800">
                <strong className="font-semibold text-purple-700">Address:</strong> {savedShippingInfo.address}, {savedShippingInfo.city},{" "}
                {savedShippingInfo.state} {savedShippingInfo.zipCode}
              </p>
            </div>
            <button
              onClick={handleEdit}
              className="w-full py-3 rounded-lg font-semibold text-white shadow-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-lg transition-all duration-300"
            >
              Edit
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8 bg-white p-6 rounded-xl shadow-lg max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-800 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={shippingInfo.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={shippingInfo.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Street Address</label>
              <input
                type="text"
                name="address"
                value={shippingInfo.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-800 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-800 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-800 mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingInfo.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-lg font-semibold text-white shadow-md transition-all duration-300 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-lg"
                }`}
              >
                {isSubmitting ? "Saving..." : "Save and Continue to Payment"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-1/3 py-3.5 rounded-lg font-semibold text-gray-700 shadow-md bg-gray-100 hover:bg-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <OrderSummary currentPage="shipping_page" shippingInfoComplete={!!savedShippingInfo} />
    </div>
  );
}
