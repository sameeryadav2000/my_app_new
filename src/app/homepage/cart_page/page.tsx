"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useCart } from "@/context/CartContext";
import OrderSummary from "@/app/components/OrderSummary";

export default function CartPage() {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();
  const { cart, syncCart } = useCart();

  const handleRemove = async (id: string) => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    try {
      showLoading();

      const response = await fetch(`/api/cart?id=${id}`, {
        method: "DELETE",
        signal,
      });

      const result = await response.json();

      if (!result.success) {
        showError("Error", result.message);
        return;
      }

      showSuccess("Success", result.message);

      await syncCart();
    } catch (error) {
      showError("Error", "Failed to delete cart item. Please check your connection and try again.");
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between w-[70%] mx-auto gap-8">
      <div className="md:w-[60%] rounded-lg">
        {cart.items && cart.items.length > 0 ? (
          cart.items.map((item) => (
            <div
              key={item.id}
              className="flex md:flex-row flex-col gap-6 border-b border-gray-200 py-6 transition-all duration-300 hover:bg-white hover:shadow-sm rounded-lg px-4"
            >
              <div className="md:w-1/4 w-full flex justify-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full max-h-[160px] object-contain rounded-md transition-opacity duration-300 hover:opacity-90"
                />
              </div>

              <div className="flex-1 space-y-2">
                <h2 className="text-lg font-medium text-gray-900 tracking-tight">{item.title}</h2>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Condition:</span> {item.condition}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Storage:</span> {item.storage}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Color:</span> {item.color}
                </p>
                <p className="text-lg font-medium text-gray-900">${item.price}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Quantity:</span>
                  <span className="ml-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-xs">{item.quantity}</span>
                </p>
              </div>

              <div className="flex md:flex-col flex-row justify-between items-center gap-4">
                <span className="bg-gray-100 text-gray-800 text-center px-5 py-2 rounded-md font-medium text-sm w-16">{item.quantity}</span>

                <button
                  className="bg-black text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors duration-300"
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-gray-200 rounded-lg">
            <p className="text-base font-medium text-gray-800">Your cart is empty.</p>
            <p className="text-sm text-gray-500 mt-2">Explore our collection to find something you'll love.</p>
          </div>
        )}
      </div>

      <OrderSummary currentPage="cart_page" />
    </div>
  );
}
