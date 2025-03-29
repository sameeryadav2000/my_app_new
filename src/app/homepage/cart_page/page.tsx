"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useCart } from "@/context/CartContext";
import OrderSummary from "@/app/components/OrderSummary";
import { formatNPR } from "@/utils/formatters";

export default function CartPage() {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();
  const { cart, syncCart } = useCart();

  const fallbackImageSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23d3d3d3'/%3E%3Cg fill='white'%3E%3Cpath d='M30,30 h40 v30 h-40 z' stroke='white' stroke-width='2' fill='none'/%3E%3Cpath d='M40,40 h40 v30 h-40 z' stroke='white' stroke-width='2' fill='none'/%3E%3Ccircle cx='65' cy='50' r='4'/%3E%3Cpolygon points='50,60 60,50 70,60'/%3E%3C/g%3E%3C/svg%3E`;

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
    <div className="flex flex-col xl:flex-row justify-between w-[95%] md:w-[70%] mx-auto gap-8">
      <div className="xl:w-[60%] rounded-lg">
        {cart.items && cart.items.length > 0 ? (
          cart.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col xl:flex-row gap-4 xl:gap-6 border-b border-gray-200 py-4 xl:py-6 transition-all duration-300 hover:bg-gray-50 hover:shadow-sm rounded-lg px-3 xl:px-4"
            >
              <div className="w-full xl:w-1/4 flex justify-center">
                <img
                  src={item.image || fallbackImageSVG}
                  alt={item.titleName}
                  className="w-full max-h-[120px] xl:max-h-[160px] object-contain rounded-md transition-opacity duration-300 hover:opacity-90"
                />
              </div>

              <div className="flex-1 space-y-1.5 xl:space-y-2">
                <h2 className="text-base xl:text-xl font-medium text-gray-900 tracking-tight">{item.titleName}</h2>
                <p className="text-xs xl:text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Condition:</span> {item.condition}
                </p>
                <p className="text-xs xl:text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Storage:</span> {item.storage}
                </p>
                <p className="text-xs xl:text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Color:</span> {item.colorName}
                </p>
                <p className="text-base xl:text-lg font-medium text-gray-900">{formatNPR(item.price)}</p>
                <p className="text-xs xl:text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Quantity:</span>
                  <span className="ml-1.5 bg-gray-100 text-gray-800 px-2 xl:px-3 py-0.5 xl:py-1 rounded-md text-xs">{item.quantity}</span>
                </p>
              </div>

              <div className="flex flex-row xl:flex-col justify-between xl:justify-center items-center gap-3 xl:gap-4">
                <span className="bg-gray-100 text-gray-800 text-center px-3 xl:px-4 py-1 xl:py-1.5 rounded-md font-medium text-xs xl:text-sm w-12 xl:w-16">
                  {item.quantity}
                </span>
                <button
                  className="bg-black text-white px-3 xl:px-5 py-1.5 xl:py-2 rounded-md font-medium text-xs xl:text-sm hover:bg-gray-800 transition-colors duration-300"
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 xl:py-12 border border-gray-200 rounded-lg">
            <p className="text-sm xl:text-base font-medium text-gray-800">Your cart is empty.</p>
            <p className="text-xs xl:text-sm text-gray-500 mt-1.5 xl:mt-2">Explore our collection to find something you'll love.</p>
          </div>
        )}
      </div>
      <OrderSummary currentPage="cart_page" />
    </div>
  );
}
