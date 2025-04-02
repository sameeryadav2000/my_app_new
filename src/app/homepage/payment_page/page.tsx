"use client";

import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import OrderSummary from "@/app/components/OrderSummary";
import FullScreenLoader from "@/app/components/FullScreenLoader";

interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function PaymentPage() {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showError, showSuccess } = useNotification();
  const { cart } = useCart();
  const router = useRouter();
  const [shippingInfo, setShippingInfo] = useState<ShippingData | null>(null);

  // Just check for shipping info on load
  useEffect(() => {
    showLoading();

    const savedShippingInfo = sessionStorage.getItem("shippingInfo");
    if (savedShippingInfo) {
      try {
        setShippingInfo(JSON.parse(savedShippingInfo));
        hideLoading();
      } catch (error) {
        console.error("Error parsing shipping info:", error);
        showError("Error", "Problem with shipping information");
        setTimeout(() => {
          hideLoading();
          router.push("/homepage/shipping_page");
        }, 1500);
      }
    } else {
      showError("Error", "Please provide shipping information first");
      setTimeout(() => {
        hideLoading();
        router.push("/homepage/shipping_page");
      }, 1500);
    }
  }, [router, showError, showLoading, hideLoading]);

  const generateOrderNumber = () => {
    const timestamp = new Date().getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `ORD-${timestamp}-${random}`;
  };

  const handlePlaceOrder = async () => {
    if (!shippingInfo) {
      showError("Error", "Shipping information is required");
      return;
    }

    showLoading();
    let isMounted = true;

    try {
      const orderNumber = generateOrderNumber();

      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.items,
          orderNumber: orderNumber,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        if (isMounted) {
          showError("Error", result.message || "Failed to place order");
        }
        return;
      }

      // Clear shipping info after successful order
      if (isMounted) {
        sessionStorage.removeItem("shippingInfo");

        // Show success notification
        showSuccess("Success", "Order placed successfully!");

        // Redirect to confirmation page
        router.push(`/homepage/order_confirmation/${result.orderId}`);
      }
    } catch (error) {
      console.error("Error in payment processing: ", error);

      if (isMounted) {
        showError("Error", "Something went wrong. Please try again.");
      }
    } finally {
      if (isMounted) {
        hideLoading();
      }
    }

    return () => {
      isMounted = false;
    };
  };

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="flex flex-col xl:flex-row justify-between w-[95%] md:w-[70%] mx-auto gap-8 pb-10 xl:pb-16">
      <div className="xl:w-[60%]">
        <div className="flex items-center gap-3 xl:gap-4 mb-4 xl:mb-6">
          <h1 className="text-2xl xl:text-3xl font-bold text-gray-800">Payment Method</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 xl:p-6 mb-4 xl:mb-6 border border-gray-200">
          <div className="flex items-center mb-3 xl:mb-4">
            <input
              id="cod"
              type="radio"
              checked={true}
              readOnly
              className="h-4 w-4 xl:h-5 xl:w-5 text-black focus:ring-black border-gray-300"
            />
            <label htmlFor="cod" className="ml-2 xl:ml-3 text-base xl:text-lg font-medium text-gray-800">
              Cash on Delivery
            </label>
          </div>

          <p className="text-xs xl:text-sm text-gray-600 ml-6 xl:ml-8 mb-3 xl:mb-4">
            You will pay when your order is delivered. Please have the exact amount ready.
          </p>

          <div className="border-t border-gray-200 pt-3 xl:pt-4 mt-1 xl:mt-2">
            <h3 className="text-base xl:text-lg font-medium text-gray-800 mb-2 xl:mb-3">Delivery Information</h3>

            {shippingInfo && (
              <div className="bg-gray-50 p-3 xl:p-4 rounded-md">
                <p className="text-sm xl:text-base text-gray-700 mb-1 xl:mb-2">
                  <span className="font-medium">Name:</span> {shippingInfo.firstName} {shippingInfo.lastName}
                </p>
                <p className="text-sm xl:text-base text-gray-700 mb-1 xl:mb-2">
                  <span className="font-medium">Address:</span> {shippingInfo.address}
                </p>
                <p className="text-sm xl:text-base text-gray-700 mb-1 xl:mb-2">
                  <span className="font-medium">City:</span> {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                </p>
                <p className="text-sm xl:text-base text-gray-700 mb-1 xl:mb-2">
                  <span className="font-medium">Phone:</span> {shippingInfo.phone}
                </p>
                {shippingInfo.email && (
                  <p className="text-sm xl:text-base text-gray-700">
                    <span className="font-medium">Email:</span> {shippingInfo.email}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => router.push("/homepage/shipping_page")}
              className="mt-3 xl:mt-4 text-xs xl:text-sm text-gray-600 underline hover:text-black"
            >
              Edit Shipping Information
            </button>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={isLoading || !shippingInfo}
          className="w-full py-2 xl:py-3 px-4 xl:px-6 bg-black text-white text-sm xl:text-base rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 xl:mr-3 h-4 w-4 xl:h-5 xl:w-5 text-white"
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
              Processing...
            </div>
          ) : (
            "Place Order"
          )}
        </button>

        <div className="mt-3 xl:mt-4 text-xs xl:text-sm text-gray-600">
          By placing your order, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>

      <OrderSummary currentPage="payment_page" />
    </div>
  );
}
