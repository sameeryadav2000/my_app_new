// src/app/homepage/shipping_page/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext";
import OrderSummary from "@/app/components/OrderSummary";
import { useSession } from "next-auth/react";

interface ShippingForm {
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
  const router = useRouter();
  const { cart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false); // Toggle between display and edit mode
  const [savedShippingInfo, setSavedShippingInfo] =
    useState<ShippingForm | null>(null); // Store fetched data

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
    if (status === "loading") return; // Wait for session to load
    if (!session || !session.user) {
      router.push("/login_signup");
    }
  }, [status, session, router]);

  // useEffect(() => {
  //   if (!cart.items || cart.items.length === 0) {
  //     router.push("/homepage/cart_page");
  //   }
  // }, [cart.items, router]);

  // Fetch shipping info
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const fetchShippingInfo = async () => {
      try {
        const response = await fetch(`/api/shipping`);
        const data = await response.json();
        if (response.ok && data) {
          setSavedShippingInfo(data);
          setShippingInfo(data);
          sessionStorage.setItem("shippingInfo", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching shipping info:", error);
      }
    };

    fetchShippingInfo();
  }, [session, status]);

  const handleBackToCart = () => {
    router.push("/homepage/cart_page");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/shipping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...shippingInfo,
          userId: session?.user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save shipping information");
      }

      // If save is successful, save to session storage as backup
      sessionStorage.setItem("shippingInfo", JSON.stringify(shippingInfo));
      setSavedShippingInfo(shippingInfo);
      setIsEditing(false);
      // Navigate to payment page
    } catch (error) {
      console.error("Error saving shipping information:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Render nothing until session is resolved
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || !session.user) {
    return null; // Router will handle redirect
  }

  return (
    <div className="flex flex-col md:flex-row justify-between w-4/5 mx-auto gap-8">
      <div className="md:w-[70%] p-5">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToCart}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to cart
          </button>
          <h2 className="text-2xl font-bold">Shipping Information</h2>
        </div>

        {savedShippingInfo && !isEditing ? (
          <div className="bg-gray-100 p-6 rounded-lg space-y-4">
            <p>
              <strong>Name:</strong> {savedShippingInfo.firstName}{" "}
              {savedShippingInfo.lastName}
            </p>
            <p>
              <strong>Email:</strong> {savedShippingInfo.email}
            </p>
            <p>
              <strong>Phone:</strong> {savedShippingInfo.phone}
            </p>
            <p>
              <strong>Address:</strong> {savedShippingInfo.address},{" "}
              {savedShippingInfo.city}, {savedShippingInfo.state}{" "}
              {savedShippingInfo.zipCode}
            </p>
            <button
              onClick={handleEdit}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              Edit
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={shippingInfo.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={shippingInfo.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={shippingInfo.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingInfo.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {isSubmitting ? "Saving..." : "Save and Continue to Payment"}
              </button>
            </div>
          </form>
        )}
      </div>

      <OrderSummary currentPage="shipping_page" />
    </div>
  );
}
