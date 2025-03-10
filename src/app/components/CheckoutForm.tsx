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
import { ShippingForm } from "@/app/homepage/shipping_page/page";

interface CheckoutFormProps {
  totalAmount: number;
  shippingInfo: ShippingForm;
}

export default function CheckoutForm({
  totalAmount,
  shippingInfo,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // The confirmPayment call will redirect on success
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
                country: "US",
              },
            },
          },
        },
        redirect: "always", // Changed from "always" to handle both cases
      });

      if (error) {
        setPaymentError(
          error.message || "Something went wrong with your payment"
        );
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
        <PaymentElement />
      </div>

      {paymentError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm transition-all duration-300">
          {paymentError}
        </div>
      )}

      <button
        disabled={isProcessing || !stripe || !elements}
        className={`w-full flex items-center justify-center py-3.5 px-4 rounded-lg font-semibold text-white shadow-md transition-all duration-300 ${
          isProcessing || !stripe || !elements
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-lg"
        }`}
      >
        <FaLock className="mr-2 h-5 w-5" />
        {isProcessing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
      </button>

      {/* Security Note */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 py-2 rounded-lg">
        <FaLock className="h-4 w-4 text-purple-600" />
        <span className="font-medium">
          Your payment information is secure and encrypted
        </span>
      </div>
    </form>
  );
}
