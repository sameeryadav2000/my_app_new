// src/components/CartRecovery.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

const CartRecovery = () => {
  const { data: session } = useSession();
  const { cart, setCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Only run this when a user session exists and has just been established
    if (session) {
      // Check if there's a pending cart item that was saved before login
      const pendingItemJSON = sessionStorage.getItem("pendingCartItem");
      
      if (pendingItemJSON) {
        try {
          const pendingItem = JSON.parse(pendingItemJSON);
          
          // Add quantity property if it doesn't exist
          if (!pendingItem.quantity) {
            pendingItem.quantity = 1;
          }
          
          // Check if this exact item already exists in the cart
          const existingItemIndex = cart.items.findIndex(
            (item) =>
              item.id === pendingItem.id &&
              item.condition === pendingItem.condition &&
              item.storage === pendingItem.storage &&
              item.color === pendingItem.color
          );
          
          let updatedCart;
          
          if (existingItemIndex > -1) {
            // If item exists, increment its quantity
            const updatedItems = cart.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
            updatedCart = {
              items: updatedItems,
              totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
              subTotalPrice: updatedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              ),
            };
          } else {
            // If item doesn't exist, add it to cart
            updatedCart = {
              items: [...cart.items, pendingItem],
              totalItems: cart.totalItems + 1,
              subTotalPrice: cart.subTotalPrice + pendingItem.price,
            };
          }
          
          // Update the cart
          setCart(updatedCart);
          
          // Clear the pending item
          sessionStorage.removeItem("pendingCartItem");
          
          // Redirect to cart page
          router.push("/homepage/cart_page");
        } catch (error) {
          console.error("Error recovering cart item:", error);
          sessionStorage.removeItem("pendingCartItem");
        }
      }
    }
  }, [session, cart, setCart, router]);

  // This component doesn't render anything visible
  return null;
};

export default CartRecovery;