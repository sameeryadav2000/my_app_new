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

  useEffect(() => {
    if (!isInitialCheckDone || !shippingInfo) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    async function createPaymentIntent() {
      try {
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
          console.error("Error:", data.error);
          return;
        }

        setClientSecret(data.clientSecret);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Payment intent request was cancelled");
          return;
        }
        console.error("Error creating payment intent:", error);
      } finally {
        hideLoading();
      }
    }

    if (totalAmount > 0) {
      createPaymentIntent();
    } else {
      hideLoading();
    }

    return () => {
      abortController.abort();
      hideLoading();
    };
  }, [isInitialCheckDone, shippingInfo]);

  return (
    <div className="flex flex-col md:flex-row justify-between w-4/5 mx-auto gap-8">
      {/* Left Section: Payment */}
      <div className="md:w-[70%] p-5">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Payment
          </h1>
        </div>

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
          </div>
        )}
      </div>

      {/* Right Section: Order Summary */}
      <OrderSummary currentPage="payment_page" />
    </div>
  );
}
