"use client";

import { useLoading } from "@/context/LoadingContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

interface OrderSummaryProps {
  currentPage: "cart_page" | "shipping_page" | "payment_page";
  shippingInfoComplete?: boolean;
}

export default function OrderSummary({ currentPage, shippingInfoComplete = false }: OrderSummaryProps) {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { cart } = useCart();
  const router = useRouter();

  const tax = 10;
  const taxAmount = cart.subTotalPrice * (tax / 100);
  const qualityAssuranceFee = 3;
  const totalAmount = taxAmount + cart.subTotalPrice + qualityAssuranceFee;

  const isCartEmpty = !cart.items || cart.items.length === 0;

  useEffect(() => {
    return () => {
      hideLoading();
    };
  }, []);

  const handleCheckout = () => {
    showLoading();

    setTimeout(() => {
      router.push("/homepage/shipping_page");

      setTimeout(() => {
        hideLoading;
      }, 1000);
    }, 500);
  };

  return (
    <div className="md:w-[40%] w-full">
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm sticky top-4 p-6">
        <h2 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-200">Order Summary</h2>

        {cart.items && cart.items.length > 0 ? (
          <div className="space-y-4 mb-6">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-start py-3 border-b border-gray-200 last:border-b-0">
                <div className="bg-gray-100 rounded-md p-2 flex-shrink-0">
                  <img src={item.image} alt={item.title} className="w-14 h-14 object-contain" />
                </div>

                <div className="pl-4 flex-grow">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">{item.title}</span>
                    <span className="font-medium">${item.price}</span>
                  </div>

                  <div className="flex pt-2">
                    <span className="text-sm text-gray-500">Quantity:</span>
                    <span className="text-sm ml-auto">{item.quantity}</span>
                  </div>

                  <div className="flex pt-1">
                    <span className="text-sm text-gray-500">Shipping</span>
                    <span className="text-sm text-success ml-auto">Free</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="text-gray-400 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-500">Your cart is empty.</p>
          </div>
        )}

        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${cart.subTotalPrice}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Quality Assurance Fee</span>
            <span>${qualityAssuranceFee}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Estimated Tax ({tax}%)</span>
            <span>${taxAmount}</span>
          </div>
        </div>

        <div className="flex justify-between items-center py-4 mt-4 border-t border-gray-200">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">${totalAmount}</span>
        </div>

        {currentPage === "cart_page" && (
          <div className="mt-6">
            <button
              onClick={handleCheckout}
              disabled={isLoading || cart.items.length === 0}
              className="w-full bg-black text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                </>
              ) : (
                "Proceed to Checkout"
              )}
            </button>
          </div>
        )}

        {currentPage === "shipping_page" && (
          <div className="mt-6">
            {isCartEmpty || !shippingInfoComplete ? (
              <button
                disabled
                className="w-full bg-gray-300 text-white py-3 rounded-md font-medium cursor-not-allowed"
                title={isCartEmpty ? "Your cart is empty" : "Please complete shipping information"}
              >
                Continue to Payment
              </button>
            ) : (
              <Link href="/homepage/payment_page">
                <button className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors">
                  Continue to Payment
                </button>
              </Link>
            )}
          </div>
        )}

        <div className="mt-4 text-xs text-center text-gray-500">All transactions are secure and encrypted</div>
      </div>
    </div>
  );
}
