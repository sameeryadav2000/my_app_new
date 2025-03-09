"use client";

import { useCart } from "@/context/CartContext";
import OrderSummary from "@/app/components/OrderSummary";

export default function CartPage() {
  const { cart, syncCart } = useCart();

  const handleRemove = async (id: string) => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    try {
      // Sync with server first
      const response = await fetch(`/api/cart?id=${id}`, {
        method: "DELETE",
        signal,
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      } else {
        await syncCart();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error("Delete aborted");
      } else {
        console.error("Error removing cart item:", error);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between w-[70%] mx-auto gap-8">
      <div className="md:w-[60%] rounded-xl">
        {cart.items && cart.items.length > 0 ? (
          cart.items.map((item) => (
            <div
              key={item.id}
              className="flex md:flex-row flex-col gap-6 border-b border-gray-200 py-6 transition-all duration-300 hover:bg-white hover:shadow-md rounded-lg px-4"
            >
              <div className="md:w-1/4 w-full flex justify-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full max-h-[180px] object-contain rounded-lg transform hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-semibold text-gray-800 tracking-tight hover:text-indigo-600 transition-colors duration-200">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Condition:</span>{" "}
                  {item.condition}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Storage:</span>{" "}
                  {item.storage}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Color:</span>{" "}
                  {item.color}
                </p>
                <p className="text-lg font-bold text-gray-900">${item.price}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Quantity:</span>
                  <span className="ml-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {item.quantity}
                  </span>
                </p>
              </div>

              <div className="flex md:flex-col flex-row justify-between items-center gap-4">
                <span className="bg-gray-200 text-gray-800 text-center px-6 py-2 rounded-full font-medium text-sm w-20">
                  {item.quantity}
                </span>

                <button
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full font-medium text-sm shadow-md hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300"
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-lg font-medium text-gray-700 tracking-wide">
              Your cart is empty.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Explore our collection to find something exquisite.
            </p>
          </div>
        )}
      </div>

      <OrderSummary currentPage="cart_page" />
    </div>
  );
}
