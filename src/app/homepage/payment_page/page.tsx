// src/app/homepage/payment_page/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Elements } from "@stripe/react-stripe-js";
import { getStripePromise } from "../../../../lib/stripe_client";
import CheckoutForm from "@/app/components/CheckoutForm";
import OrderSummary from "@/app/components/OrderSummary";

export default function PaymentPage() {
  const router = useRouter();
  const { cart, isLoading: isCartLoading } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [shippingInfo, setShippingInfo] = useState<any>(null);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
  const { showLoading, hideLoading, isLoading } = useLoading();
  const [paymentError, setPaymentError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Calculate order total
  const tax = 10;
  const qualityAssuranceFee = 3.99;
  const taxAmount = Number((cart.subTotalPrice * (tax / 100)).toFixed(2));
  const totalAmount = Number(
    (taxAmount + cart.subTotalPrice + qualityAssuranceFee).toFixed(2)
  );

  useEffect(() => {
    // Flag to track if component is mounted
    let isMounted = true;

    // Show loading right away
    showLoading();

    const checkCartAndShipping = () => {
      const storedShippingInfo = sessionStorage.getItem("shippingInfo");

      // If cart is still loading from database, wait
      if (isCartLoading) {
        return;
      }

      // Skip processing if the component unmounted
      if (!isMounted) return;

      // Once cart is loaded, check if it's empty
      if (!cart.items || cart.items.length === 0) {
        hideLoading();
        router.push("/homepage/cart_page");
        return;
      }

      // Check for shipping info
      if (!storedShippingInfo) {
        hideLoading();
        router.push("/homepage/shipping_page");
        return;
      }

      // Set shipping info if available
      if (isMounted) {
        setShippingInfo(JSON.parse(storedShippingInfo));
        setIsInitialCheckDone(true);
        // Don't hide loading yet, as we'll need to create the payment intent next
      }
    };

    checkCartAndShipping();

    // Cleanup function for when component unmounts
    return () => {
      isMounted = false;
      hideLoading(); // Ensure loading is hidden when component unmounts
    };
  }, [isCartLoading]);

  // Extract createPaymentIntent outside of useEffect
  const createPaymentIntent = async () => {
    try {
      showLoading(); // Show loading when retrying

      const abortController = new AbortController();
      const signal = abortController.signal;

      const response = await fetch("/api/create_payment_intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          metadata: {
            orderId: `order-${Date.now()}`,
            customerEmail: shippingInfo?.email || "",
            items: JSON.stringify(
              cart.items.map((item) => ({
                id: item.id,
                title: item.title,
                quantity: item.quantity,
              }))
            ),
          },
        }),
        signal,
      });

      const data = await response.json();

      if (data.error) {
        console.error("Error:", data.error, data.message || "");
        setPaymentError(data.message || data.error);
        return;
      }

      setPaymentError("");
      setClientSecret(data.clientSecret);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Payment intent request was cancelled");
        return;
      }
      console.error("Error creating payment intent:", error);
      setPaymentError("Unable to initialize payment. Please try again.");
    } finally {
      hideLoading();
    }
  };

  // Modified useEffect to use the extracted function
  useEffect(() => {
    if (!isInitialCheckDone || !shippingInfo) return;

    if (totalAmount > 0) {
      createPaymentIntent();
    } else {
      hideLoading();
    }

    return () => {
      hideLoading();
    };
  }, [isInitialCheckDone, shippingInfo, retryCount]);
  return (
    <div className="flex flex-col md:flex-row justify-between w-4/5 mx-auto gap-8">
      {/* Left Section: Payment */}
      <div className="md:w-[70%] p-5">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Payment
          </h1>
        </div>

        {/* Display payment error if exists */}
        {paymentError && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="font-medium">Payment Error:</span> {paymentError}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Preparing secure checkout...
            </p>
          </div>
        ) : clientSecret ? (
          <Elements stripe={getStripePromise()} options={{ clientSecret }}>
            <CheckoutForm
              totalAmount={totalAmount}
              shippingInfo={shippingInfo}
            />
          </Elements>
        ) : (
          <div className="p-8 text-center text-red-500 font-medium">
            Unable to initialize payment system. Please try again later.
            {paymentError && (
              <button
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Section: Order Summary */}
      <OrderSummary currentPage="payment_page" />
    </div>
  );
}
