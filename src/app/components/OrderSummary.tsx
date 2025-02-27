// src/components/OrderSummary.tsx
"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from 'next/link';

interface OrderSummaryProps {
  currentPage: "cart_page" | "shipping_page";
}

const OrderSummary = ({ currentPage }: OrderSummaryProps) => {
  const { cart } = useCart();
  const router = useRouter();

  const tax = 10;
  const taxAmount = Number((cart.subTotalPrice * (tax / 100)).toFixed(2));
  const totalAmount = (taxAmount + cart.subTotalPrice).toFixed(2);

  const handleCheckout = () => {
    router.push("/homepage/shipping_page");
  };

  return (
    <div className="md:w-[30%]">
      <div className="w-full bg-gray-50 rounded-lg sticky top-4 p-4">
        <div className="border">
          <h2 className="text-xl font-medium mb-6">Summary</h2>
        </div>

        {cart.items && cart.items.length > 0 ? (
          cart.items.map((item) => (
            <div key={item.id} className="flex justify-start border">
              <img
                src="../../../../iphone_images/image.png"
                alt="iPhone"
                className="w-20 h-120 object-contain"
              />

              <div className="pl-4 flex-grow">
                <div className="text-sm flex">
                  <span>{item.title}</span>
                  <span className="ml-auto">{item.price}</span>
                </div>

                <div className="flex pt-5">
                  <span className="text-sm text-gray-500">Shipping</span>
                  <span className="text-sm text-gray-500 ml-auto">Free</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}

        <div className="space-y-3 border-t border-gray-200 pt-4 border">
          <div className="flex justify-between">
            <span className="text-sm">Subtotal</span>
            <span className="text-sm">${cart.subTotalPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Quality Assurance Fee</span>
            <span className="text-sm text-gray-500">$3.99</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Estimated taxes</span>
            <span className="text-sm text-gray-500">{taxAmount}</span>
          </div>
        </div>

        <div className="flex justify-between py-4 border border-red-200 mt-4">
          <span className="font-medium">Total</span>
          <span className="font-medium">$ {totalAmount}</span>
        </div>

        {currentPage === "cart_page" && (
          <div>
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        )}

        {currentPage === "shipping_page" && (
          <div>
            <Link href="/homepage/payment_page">
              <button className="w-full bg-black text-white py-3 rounded-lg">
                Continue to Payment
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
