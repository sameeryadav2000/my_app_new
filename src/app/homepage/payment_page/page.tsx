// src/app/homepage/payment_page/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Elements } from "@stripe/react-stripe-js";
import { getStripePromise } from "../../../../lib/stripe_client";
import CheckoutForm from "./CheckoutForm";

export default function PaymentPage() {
  const router = useRouter();
  const { cart } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [shippingInfo, setShippingInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate order total
  const tax = 10;
  const qualityAssuranceFee = 3.99;
  const taxAmount = Number((cart.subTotalPrice * (tax / 100)).toFixed(2));
  const totalAmount = Number(
    (taxAmount + cart.subTotalPrice + qualityAssuranceFee).toFixed(2)
  );

  const storedShippingInfo = sessionStorage.getItem("shippingInfo");
  if (!cart.items || cart.items.length === 0) {
    router.push("/homepage/cart_page");
    return null; // Early return to prevent rendering
  }
  if (!storedShippingInfo) {
    router.push("/homepage/shipping_page");
    return null; // Early return
  }
  if (!shippingInfo) {
    setShippingInfo(JSON.parse(storedShippingInfo)); // Set once on first render
  }

  useEffect(() => {

    // Create a payment intent as soon as the page loads
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
        });

        const data = await response.json();

        if (data.error) {
          console.error("Error:", data.error);
          return;
        }

        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (shippingInfo && totalAmount > 0) {
      createPaymentIntent();
    }
  }, [cart.items, router, totalAmount, cart.subTotalPrice]);

  return (
    <div className="flex flex-col md:flex-row w-4/5 mx-auto gap-8 py-8">
      <div className="md:w-[60%] order-2 md:order-1">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/homepage/shipping_page")}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to shipping
          </button>
          <h1 className="text-2xl font-bold">Payment</h1>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Preparing secure checkout...</p>
          </div>
        ) : clientSecret ? (
          <Elements stripe={getStripePromise()} options={{ clientSecret }}>
            <CheckoutForm
              totalAmount={totalAmount}
              shippingInfo={shippingInfo}
            />
          </Elements>
        ) : (
          <div className="p-8 text-center text-red-500">
            Unable to initialize payment system. Please try again later.
          </div>
        )}
      </div>

      {/* Order summary section - same as before */}
      <div className="md:w-[40%] order-1 md:order-2">
        {/* Your existing order summary code */}
      </div>
    </div>
  );
}
