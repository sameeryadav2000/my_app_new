"use client";

import { useEffect } from "react";
import { useLoading } from "@/src/context/LoadingContext";
import { useNotification } from "@/src/context/NotificationContext";
import { useCart } from "@/src/context/CartContext";
import OrderSummary from "@/src/app/components/OrderSummary";
import { formatNPR } from "@/src/utils/formatters";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();

  const { showLoading, hideLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();
  const { cart, syncCart, syncNotify, clearSyncNotify, isLoading: isCartLoading } = useCart();

  const handleRemove = async (phoneModelDetailsId: number) => {
    let isMounted = true;

    try {
      showLoading();

      const response = await fetch(`/api/cart?phoneModelDetailsId=${phoneModelDetailsId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      // Check if component is still mounted before updating state or showing notifications
      if (!isMounted) return;

      if (!result.success) {
        showError("Error", result.message);
        return;
      }

      showSuccess("Success", result.message);

      // Only sync cart if still mounted
      if (isMounted) {
        await syncCart();
      }
    } catch (error) {
      // Check if component is still mounted before showing error
      if (!isMounted) return;

      console.error("Failed to delete cart item: ", error);
      showError("Error", "Failed to delete cart item. Please check your connection and try again.");
    } finally {
      // Only hide loading if still mounted
      if (isMounted) {
        hideLoading();
      }
    }

    // We need a way to properly clean up - this is normally done in a useEffect
    // But since this is a function, you'll want to handle cleanup where it's called
    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    if (syncNotify && !syncNotify.success) {
      // Only show error notifications, ignore success ones
      showError("Cart Sync Error", syncNotify.message);
      // Clear the notification after displaying
      clearSyncNotify();
    }
  }, [syncNotify, showError, clearSyncNotify]);

  useEffect(() => {
    // Only check after cart loading is complete
    if (!isCartLoading && cart.items.length === 0) {
      showInfo("Empty Cart", "Your cart is empty. Redirecting to home");
      // Short timeout for smoother transition
      const timer = setTimeout(() => {
        router.push("/");
      }, 1000); // 500ms delay for smooth transition

      return () => clearTimeout(timer);
    }
  }, [cart.items.length, isCartLoading, router, showInfo]);

  return (
    <div className="flex flex-col xl:flex-row justify-between w-[95%] md:w-[70%] mx-auto gap-8 pb-16">
      <div className="xl:w-[60%] rounded-lg">
        {cart.items && cart.items.length > 0 ? (
          cart.items.map((item) => (
            <div
              key={item.phoneModelDetailsId}
              className="flex flex-col xl:flex-row gap-4 xl:gap-6 border-b border-gray-200 py-4 xl:py-6 transition-all duration-300 hover:bg-gray-50 hover:shadow-sm rounded-lg px-3 xl:px-4"
            >
              <div className="w-full xl:w-1/4 flex justify-center">
                <div className="relative w-full h-[120px] xl:h-[160px]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.titleName || "Product Image"}
                      fill
                      className="object-contain rounded-md transition-opacity duration-300 hover:opacity-90"
                    />
                  ) : (
                    <div className="bg-gray-50 absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
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
                  onClick={() => handleRemove(item.phoneModelDetailsId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 xl:py-12 border border-gray-200 rounded-lg">
            <p className="text-sm xl:text-base font-medium text-gray-800">Your cart is empty.</p>
            <p className="text-xs xl:text-sm text-gray-500 mt-1.5 xl:mt-2">Explore our collection to find something you will love.</p>
          </div>
        )}
      </div>
      <OrderSummary currentPage="cart" />
    </div>
  );
}
