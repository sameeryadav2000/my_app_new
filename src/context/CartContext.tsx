// src/context/CartContext.tsx
"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  id: string;
  title: string;
  condition: string;
  storage: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subTotalPrice: number;
}

interface CartContextType {
  cart: Cart;
  setCart: (cart: Cart) => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    subTotalPrice: 0,
  });

  // This effect runs when the session status changes
  useEffect(() => {
    const syncCart = async () => {
      setIsLoading(true);

      if (status === "loading") {
        return;
      }

      // If user is logged in, try to fetch their cart from database
      if (session) {
        try {
          const response = await fetch("/api/cart");

          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }

          if (response.ok) {
            const data = await response.json();

            if (data.cart) {
              setCart(data.cart);
              localStorage.setItem("cart", JSON.stringify(data.cart));
            }
          }
          
        } catch (error) {
          console.error("Failed to fetch cart from database:", error);

          // If fetching fails, fall back to localStorage
          const localCart = localStorage.getItem("cart");
          if (localCart) {
            setCart(JSON.parse(localCart));
          }
        }
      } else {
        // If user is not logged in, use localStorage
        const localCart = localStorage.getItem("cart");
        if (localCart) {
          setCart(JSON.parse(localCart));
        } else {
          setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
        }
      }

      setIsLoading(false);
    };

    syncCart();

  }, [session, status]);

  // Listen for storage changes across tabs
  // useEffect(() => {
  //   const handleStorageChange = (event: StorageEvent) => {
  //     if (event.key === "cart" && event.newValue) {
  //       setCartState(JSON.parse(event.newValue));
  //     }
  //   };

  //   window.addEventListener("storage", handleStorageChange);
  //   return () => {
  //     window.removeEventListener("storage", handleStorageChange);
  //   };
  // }, []);

  return (
    <CartContext.Provider value={{ cart, setCart, isLoading }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
