// src/app/homepage/order_confirmation/page.tsx
"use client";

import { useLoading } from "@/context/LoadingContext";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart, CartItem } from "@/context/CartContext";
import Link from "next/link";
import { FaCheckCircle, FaEnvelope, FaFileAlt, FaHome, FaTimesCircle } from "react-icons/fa";
import { getStripePromise } from "../../../../lib/stripe_client";
import { ShippingForm } from "@/app/homepage/shipping_page/page";

interface OrderDetails {
  orderNumber: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  fee: number;
  shippingInfo: ShippingForm;
}

export default function OrderConfirmationPage() {
  const { showLoading, hideLoading } = useLoading();
  const { cart, setCart, isLoading: isCartLoading } = useCart();
  const [hasError, setHasError] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    orderNumber: "",
    items: [],
    total: 0,
    subtotal: 0,
    tax: 0,
    fee: 0,
    shippingInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentIntentId = searchParams.get("payment_intent");
  const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret");

  const generateOrderNumber = () => {
    const timestamp = new Date().getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `ORD-${timestamp}-${random}`;
  };

  useEffect(() => {
    if (isCartLoading) {
      return;
    }

    if (paymentIntentId && paymentIntentClientSecret) {
      const verifyPayment = async () => {
        try {
          const stripe = await getStripePromise();
          const { paymentIntent } = await stripe!.retrievePaymentIntent(paymentIntentClientSecret);

          if (paymentIntent?.status === "succeeded") {
            const shippingData = sessionStorage.getItem("shippingInfo");

            if (cart.items.length && shippingData) {
              const shipping = JSON.parse(shippingData);

              const subtotal = cart.subTotalPrice;
              const tax = subtotal * 0.1;
              const fee = 3;

              const orderNumber = generateOrderNumber();

              try {
                showLoading();

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
                  console.error("Error", result.message);
                  setIsVerified(true);
                  setHasError(true);
                  return;
                }

                setCart({
                  items: [],
                  totalItems: 0,
                  subTotalPrice: 0,
                });

                setOrderDetails({
                  orderNumber: orderNumber,
                  items: cart.items,
                  total: subtotal + tax + fee,
                  subtotal: subtotal,
                  tax: tax,
                  fee: fee,
                  shippingInfo: shipping,
                });
                setIsVerified(true);
              } catch (error) {
                console.error("Error", "Error buying product. Please check your connection and try again.");
                setHasError(true);
                setIsVerified(true);
              } finally {
                hideLoading();
              }
            } else {
              setHasError(true);
              setIsVerified(true);
              setTimeout(() => {
                router.replace("/homepage");
              }, 3000);
            }
          } else {
            console.error("Payment failed:", paymentIntent?.status ? paymentIntent?.status : "");
            setHasError(true);
            setIsVerified(true);
            setTimeout(() => {
              router.replace("/homepage/cart_page");
            }, 5000);
          }
        } catch (error) {
          console.error("Payment failed:", "Error verifying payment:");
          setHasError(true);
          setIsVerified(true);
        } finally {
          hideLoading();
        }
      };

      verifyPayment();
    } else {
      setHasError(true);
      setIsVerified(true);
      router.replace("/homepage");
    }
  }, [paymentIntentId, paymentIntentClientSecret, isCartLoading]);

  const formatDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  if (isCartLoading || !isVerified) {
    return (
      <div className="w-4/5 mx-auto py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border p-8">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Verifying your order...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-4/5 mx-auto py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border p-8">
        {hasError ? (
          <div className="text-center mb-10">
            <FaTimesCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Order Could Not Be Completed</h1>
            <p className="text-gray-600">We encountered an issue while processing your order.</p>
            <p className="text-gray-600 mt-2">Please try again or contact our customer support for assistance.</p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/homepage/cart_page"
                className="flex items-center justify-center gap-2 py-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FaHome className="w-4 h-4" />
                Return to Cart
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Thank You for Your Order!</h1>
              <p className="text-gray-600">Your order #{orderDetails.orderNumber} has been placed successfully</p>
              <p className="text-gray-600 mt-1">
                A confirmation email has been sent to <span className="font-medium">{orderDetails.shippingInfo.email}</span>
              </p>
            </div>

            <div className="border rounded-lg p-6 mb-8 bg-gray-50">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {orderDetails.items.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-4 pb-4 border-b">
                    <div className="w-12 h-12 flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-sm font-medium truncate">{item.title}</h3>
                      <p className="text-xs text-gray-500">
                        {item.condition} - {item.storage} - {item.color}
                      </p>
                      <div className="flex justify-between mt-1 text-sm">
                        <span>Qty: {item.quantity}</span>
                        <span>${item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${orderDetails.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>${orderDetails.tax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quality Assurance Fee</span>
                  <span>${orderDetails.fee}</span>
                </div>
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
                  {orderDetails.shippingInfo.firstName} {orderDetails.shippingInfo.lastName}
                  <br />
                  {orderDetails.shippingInfo.address}
                  <br />
                  {orderDetails.shippingInfo.city}, {orderDetails.shippingInfo.state} {orderDetails.shippingInfo.zipCode}
                  <br />
                  {orderDetails.shippingInfo.phone}
                </address>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Estimated Delivery</h3>
                <p className="text-sm text-gray-600 mb-1">
                  Expected arrival: {formatDate(5)} - {formatDate(7)}
                </p>
                <p className="text-xs text-gray-500">You will receive tracking information by email once your order ships.</p>
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
          </>
        )}
      </div>

      {/* Show additional information sections only when there's no error */}
      {!hasError && (
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
              If you need to cancel or modify your order, please contact us within 1 hour of placing your order. After that time, your order
              will begin processing for shipment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
