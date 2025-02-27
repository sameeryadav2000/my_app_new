"use client";

import { useCart } from "@/context/CartContext";
import { Cart } from "@/types/cart";
import OrderSummary from "@/app/components/OrderSummary";

export default function CartPage() {
  const { cart, setCart } = useCart();

  console.log(cart.items);

  const handleRemove = async (id: string) => {
    try {
      // Sync with server first
      const response = await fetch(`/api/cart?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to remove item from server");
      }

      // Get cart from localStorage (since you add to it there)
      const existingCartJson = localStorage.getItem("cart");
      if (!existingCartJson) return;

      const existingCart: Cart = JSON.parse(existingCartJson);
      const updatedItems = existingCart.items.filter((item) => item.id !== id);
      const updatedCart = {
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        subTotalPrice: updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };

      // Update localStorage and CartContext
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing cart item:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between w-4/5 mx-auto gap-8">
      <div className="md:w-[70%] p-5">
        {cart.items && cart.items.length > 0 ? (
          cart.items.map((item) => (
            <div
              key={item.id}
              className="flex md:flex-row flex-col gap-4 border-b py-4"
            >
              <div className="md:w-1/4 w-2/4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full max-h-[150px] object-contain"
                />
              </div>
              <div className="flex-1">
                <h2>{item.title}</h2>
                <p>Condition: {item.condition}</p>
                <p>Storage: {item.storage}</p>
                <p>Color: {item.color}</p>
                <p>Price: ${item.price}</p>
                <p>
                  Quantity:
                  <span className="ml-2 bg-gray-200 px-2 py-1 rounded">
                    {item.quantity}
                  </span>
                </p>
              </div>

              {/* Button to remove item */}
              <div className="flex justify-between items-start gap-4">
                {/* Quantity display */}
                <span className="bg-gray-300 text-center px-10 py-2 rounded">
                  {item.quantity}
                </span>

                {/* Remove button */}
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
        {/* <div className="flex flex-col md:flex-row gap-4 border">
          <div className="border">
            <img
              src="../../../../iphone_images/image.png"
              alt="placeholder"
              className="w-full max-h-[200px] object-contain"
            />
          </div>

          <div className="pl-10 border flex-1">
            <p>Text content goes here</p>
            <p>Text content goes here</p>
            <p>Text content goes here</p>
            <p>Text content goes here</p>
            <p>Text content goes here</p>
            <p>Text content goes here</p>
          </div>

          <div className="flex ml-auto gap-5 items-center">
            <div className="border flex justify-center items-center">
              <span className="px-4 py-2 bg-gray-500 text-white">Remove</span>
            </div>
            <div className="border flex justify-center items-center">
              <button className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
                Remove
              </button>
            </div>
          </div>
        </div> */}
      </div>

      <OrderSummary currentPage="cart_page" />

      {/* 
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Secure payment</span>
          </div>

          <p className="text-xs text-gray-600 mb-6">
            By confirming this order you accept our{" "}
            <a href="#" className="underline">
              Terms of Service Agreement
            </a>{" "}
            and our{" "}
            <a href="#" className="underline">
              Data Protection Policy
            </a>
          </p>

          <div className="flex gap-2 flex-wrap mb-6">
            <div className="h-8 w-12 bg-gray-200 rounded"></div>
            <div className="h-8 w-12 bg-gray-200 rounded"></div>
            <div className="h-8 w-12 bg-gray-200 rounded"></div>
            <div className="h-8 w-12 bg-gray-200 rounded"></div>
            <div className="h-8 w-12 bg-gray-200 rounded"></div>
          </div>

          <div className="flex items-center gap-2 p-3 border rounded-lg mb-4">
            <div className="h-6 w-12 bg-gray-200 rounded"></div>
            <span className="text-sm">Pay over time</span>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Items in the cart aren't reserved
          </p> */}
    </div>
  );
}
