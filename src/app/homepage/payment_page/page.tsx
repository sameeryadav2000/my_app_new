// src/app/homepage/payment_page/page.tsx
"use client";

import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Elements } from "@stripe/react-stripe-js";
import { getStripePromise } from "../../../../lib/stripe_client";
import CheckoutForm from "@/app/components/CheckoutForm";
import OrderSummary from "@/app/components/OrderSummary";
import { ShippingForm } from "@/app/homepage/shipping_page/page";

export default function PaymentPage() {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();

  const router = useRouter();
  const { cart, isLoading: isCartLoading } = useCart();
  const [clientSecret, setClientSecret] = useState<string>("");
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
  const [isInitialCheckDone, setIsInitialCheckDone] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>("");
  const [retryCount, setRetryCount] = useState<number>(0);

  const tax = 10;
  const qualityAssuranceFee = 3;
  const taxAmount = cart.subTotalPrice * (tax / 100);
  const totalAmount = taxAmount + cart.subTotalPrice + qualityAssuranceFee;

  useEffect(() => {
    let isMounted = true;

    showLoading();

    const checkCartAndShipping = () => {
      const storedShippingInfo = sessionStorage.getItem("shippingInfo");

      if (isCartLoading) {
        return;
      }

      if (!isMounted) return;

      if (!cart.items || cart.items.length === 0) {
        hideLoading();
        router.push("/homepage/cart_page");
        return;
      }

      if (!storedShippingInfo) {
        hideLoading();
        router.push("/homepage/shipping_page");
        return;
      }

      if (isMounted) {
        setShippingInfo(JSON.parse(storedShippingInfo));
        setIsInitialCheckDone(true);
        hideLoading();
      }
    };

    checkCartAndShipping();

    return () => {
      isMounted = false;
      hideLoading();
    };
  }, [isCartLoading]);

  const createPaymentIntent = async () => {
    try {
      showLoading();

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
      const result = await response.json();

      if (!result.success) {
        showError("Error", result.message || result.error);
        return;
      }

      setClientSecret(result.clientSecret);
    } catch (error) {
      showError("Error", "Unable to initialize payment. Please try again.");
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    if (!isInitialCheckDone) return;

    if (totalAmount > 0) {
      createPaymentIntent();
    }

    return () => {
      hideLoading();
    };
  }, [isInitialCheckDone, retryCount]);
  return (
    <div className="flex flex-col md:flex-row justify-between w-4/5 mx-auto gap-8">
      <div className="md:w-[70%] p-5">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Payment
          </h1>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Preparing secure checkout...</p>
          </div>
        ) : clientSecret ? (
          <Elements stripe={getStripePromise()} options={{ clientSecret }}>
            <CheckoutForm totalAmount={totalAmount} shippingInfo={shippingInfo} />
          </Elements>
        ) : (
          <div className="p-8 text-center text-red-500 font-medium">
            Unable to initialize payment system. Please try again later.
            <button
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <OrderSummary currentPage="payment_page" />
    </div>
  );
}
