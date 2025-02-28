// src/app/homepage/payment_page/CheckoutForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { FaLock } from "react-icons/fa";

interface CheckoutFormProps {
  totalAmount: number;
  shippingInfo: any;
}

export default function CheckoutForm({
  totalAmount,
  shippingInfo,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    try {
      // Confirm the payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/homepage/order_confirmation`,
          receipt_email: shippingInfo.email,
          payment_method_data: {
            billing_details: {
              name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
              email: shippingInfo.email,
              phone: shippingInfo.phone,
              address: {
                line1: shippingInfo.address,
                city: shippingInfo.city,
                state: shippingInfo.state,
                postal_code: shippingInfo.zipCode,
                country: "US", // Assuming US but you can make this dynamic
              },
            },
          },
        },
        redirect: "always",
      });

      if (error) {
        setPaymentError(
          error.message || "Something went wrong with your payment"
        );
        setIsProcessing(false);
      }
      // If successful, user gets redirected to confirmation page
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {paymentError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {paymentError}
        </div>
      )}

      <button
        disabled={isProcessing || !stripe || !elements}
        className={`w-full flex items-center justify-center py-3 px-4 rounded-lg transition-colors ${
          isProcessing || !stripe || !elements
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        <FaLock className="mr-2 h-4 w-4" />
        {isProcessing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
        <FaLock className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </form>
  );
}
