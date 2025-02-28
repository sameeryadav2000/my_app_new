// src/app/homepage/order_confirmation/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import {
  FaCheckCircle,
  FaEnvelope,
  FaFileAlt,
  FaHome,
  FaExclamationTriangle,
} from "react-icons/fa";
import { getStripePromise } from "../../../../lib/stripe_client";

interface OrderDetails {
  orderNumber: string;
  items: any[];
  total: number;
  shippingInfo: any;
}

export default function OrderConfirmationPage() {
  const { setCart } = useCart();

  const [orderStatus, setOrderStatus] = useState<
    "success" | "processing" | "error"
  >("processing");
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    orderNumber: "",
    items: [],
    total: 0,
    shippingInfo: null,
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  // Check if coming from Stripe redirect
  const paymentIntentId = searchParams.get("payment_intent");
  const paymentIntentClientSecret = searchParams.get(
    "payment_intent_client_secret"
  );

  useEffect(() => {
    // Generate random order number
    const generateOrderNumber = () => {
      const timestamp = new Date().getTime().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `ORD-${timestamp}-${random}`;
    };

    if (paymentIntentId && paymentIntentClientSecret) {
      // Verify payment status with Stripe
      const verifyPayment = async () => {
        try {
          const stripe = await getStripePromise();
          const { paymentIntent } = await stripe!.retrievePaymentIntent(
            paymentIntentClientSecret
          );

          if (paymentIntent?.status === "succeeded") {
            setOrderStatus("success");

            // Get cart data and shipping info
            const cartData = localStorage.getItem("cart");
            const shippingData = sessionStorage.getItem("shippingInfo");

            if (cartData && shippingData) {
              const cart = JSON.parse(cartData);
              const shipping = JSON.parse(shippingData);

              // Calculate the total amount
              const subtotal = cart.subTotalPrice || 0;
              const tax = subtotal * 0.1; // 10% tax
              const fee = 3.99; // Quality assurance fee

              setOrderDetails({
                orderNumber: generateOrderNumber(),
                items: cart.items || [],
                total: subtotal + tax + fee,
                shippingInfo: shipping,
              });

              try {
                const response = await fetch("/api/cart", {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({}), // Empty object since we don't need to send anything
                });

                const result = await response.json();

                if (!response.ok) {
                  console.error("Failed to update cart items:", result.error);
                } else {
                  console.log(
                    `${result.updatedItems} items marked as purchased`
                  );
                  setCart({
                    items: [],
                    totalItems: 0,
                    subTotalPrice: 0,
                  });
                }
              } catch (error) {
                console.error("Error calling update-status API:", error);
              }

              // Clear cart only after confirmed payment
              localStorage.removeItem("cart");
            }
          } else {
            setOrderStatus("error");
            console.error("Payment failed:", paymentIntent?.status);
            setTimeout(() => {
              router.push("/homepage/cart_page");
            }, 5000);
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          setOrderStatus("error");
        }
      };

      verifyPayment();
    } else {
      // If no payment intent params, check if we have order data in session
      const cartData = localStorage.getItem("cart");
      const shippingData = sessionStorage.getItem("shippingInfo");

      if (!cartData || !shippingData) {
        // No cart and no payment info, redirect to homepage
        setTimeout(() => {
          router.push("/homepage");
        }, 3000);
      } else {
        // We have cart data, assume this is coming from a successful checkout
        const cart = JSON.parse(cartData);
        const shipping = JSON.parse(shippingData);

        // Calculate the total amount
        const subtotal = cart.subTotalPrice || 0;
        const tax = subtotal * 0.1; // 10% tax
        const fee = 3.99; // Quality assurance fee

        setOrderDetails({
          orderNumber: generateOrderNumber(),
          items: cart.items || [],
          total: subtotal + tax + fee,
          shippingInfo: shipping,
        });

        setOrderStatus("success");

        // Clear cart
        localStorage.removeItem("cart");
      }
    }
  }, [paymentIntentId, paymentIntentClientSecret, router]);

  const formatDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Show loading state
  if (orderStatus === "processing") {
    return (
      <div className="w-4/5 mx-auto py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-gray-200 rounded mx-auto mb-8"></div>
          <div className="h-64 bg-gray-100 rounded mb-8"></div>
          <p className="text-gray-500">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (orderStatus === "error") {
    return (
      <div className="w-4/5 mx-auto py-16 text-center">
        <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <div className="text-red-500 text-xl mb-4">
          Payment processing error
        </div>
        <p className="text-gray-600 mb-8">
          There was an issue processing your payment. You will be redirected to
          your cart.
        </p>
        <button
          onClick={() => router.push("/homepage/cart_page")}
          className="bg-black text-white px-6 py-2 rounded-lg"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  // If no shipping info is available in success state
  if (!orderDetails.shippingInfo) {
    return (
      <div className="w-4/5 mx-auto py-16 text-center">
        <div className="text-gray-600 mb-8">
          Order information is not available.
        </div>
        <Link
          href="/homepage"
          className="bg-black text-white px-6 py-2 rounded-lg"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Show success state
  return (
    <div className="w-4/5 mx-auto py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border p-8">
        {/* Success Header */}
        <div className="text-center mb-10">
          <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-gray-600">
            Your order #{orderDetails.orderNumber} has been placed successfully
          </p>
          <p className="text-gray-600 mt-1">
            A confirmation email has been sent to{" "}
            <span className="font-medium">
              {orderDetails.shippingInfo.email}
            </span>
          </p>
        </div>

        {/* Order Summary */}
        <div className="border rounded-lg p-6 mb-8 bg-gray-50">
          <h2 className="text-lg font-bold mb-4">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {orderDetails.items.map((item: any) => (
              <div
                key={item.id}
                className="flex items-start gap-4 pb-4 border-b"
              >
                <div className="w-12 h-12 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-sm font-medium truncate">{item.title}</h3>
                  <p className="text-xs text-gray-500">
                    {item.condition} - {item.storage} - {item.color}
                  </p>
                  <div className="flex justify-between mt-1 text-sm">
                    <span>Qty: {item.quantity}</span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between py-2 font-medium border-t">
            <span>Total</span>
            <span>${orderDetails.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping & Delivery */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Shipping Address</h3>
            <address className="text-sm text-gray-600 not-italic">
              {orderDetails.shippingInfo.firstName}{" "}
              {orderDetails.shippingInfo.lastName}
              <br />
              {orderDetails.shippingInfo.address}
              <br />
              {orderDetails.shippingInfo.city},{" "}
              {orderDetails.shippingInfo.state}{" "}
              {orderDetails.shippingInfo.zipCode}
              <br />
              {orderDetails.shippingInfo.phone}
            </address>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Estimated Delivery</h3>
            <p className="text-sm text-gray-600 mb-1">
              Expected arrival: {formatDate(5)} - {formatDate(7)}
            </p>
            <p className="text-xs text-gray-500">
              You will receive tracking information by email once your order
              ships.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href="/homepage"
            className="flex items-center justify-center gap-2 py-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FaHome className="w-4 h-4" />
            Continue Shopping
          </Link>

          <button
            className="flex items-center justify-center gap-2 py-2 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.print()}
          >
            <FaFileAlt className="w-4 h-4" />
            Print Receipt
          </button>

          <button className="flex items-center justify-center gap-2 py-2 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FaEnvelope className="w-4 h-4" />
            Email Receipt
          </button>
        </div>
      </div>

      {/* Additional information sections */}
      <div className="max-w-3xl mx-auto mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-medium mb-2">Questions about your order?</h3>
          <p className="text-sm text-gray-600 mb-2">
            Check our{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              FAQs
            </Link>{" "}
            or contact our customer service team at support@phonestore.com.
          </p>
          <p className="text-sm text-gray-600">
            Call us at: <span className="font-medium">1-800-555-0123</span>
          </p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-medium mb-2">Need to make changes?</h3>
          <p className="text-sm text-gray-600">
            If you need to cancel or modify your order, please contact us within
            1 hour of placing your order. After that time, your order will begin
            processing for shipment.
          </p>
        </div>
      </div>
    </div>
  );
}
