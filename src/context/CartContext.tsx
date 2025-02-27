// src/context/CartContext.tsx
"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { Cart, CartItem } from "@/types/cart";
import { useSession } from "next-auth/react";

interface CartContextType {
  cart: Cart;
  setCart: (cart: Cart) => void;
  loading: boolean;
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [cart, setCartState] = useState<Cart>({
    items: [],
    totalItems: 0,
    subTotalPrice: 0,
  });

  const [loading, setLoading] = useState(true);

  // Function to set cart and sync with backend if user is logged in
  const setCart = async (newCart: Cart) => {
    setCartState(newCart);
    // console.log("cc", newCart);
    // If user is logged in, update the database as well
    // if (session) {
    //   try {
    //     await fetch("/api/cart", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({ cart: newCart }),
    //     });
    //   } catch (error) {
    //     console.error("Failed to sync cart with database:", error);
    //   }
    // }
  };

  // This effect runs when the session status changes
  useEffect(() => {
    const syncCart = async () => {
      setLoading(true);

      if (status === "loading") {
        return; // Wait until session is loaded
      }

      // If user is logged in, try to fetch their cart from database
      if (session) {
        try {
          const response = await fetch("/api/cart");
          if (response.ok) {
            const data = await response.json();

            // If there's a cart in the database, use it
            if (data.cart) {
              setCartState(data.cart);
              localStorage.setItem("cart", JSON.stringify(data.cart));
            } else {
              // If no cart in database but local storage has items,
              // push the local storage cart to the database
              const localCart = localStorage.getItem("cart");
              if (localCart) {
                const parsedCart = JSON.parse(localCart);
                setCartState(parsedCart);

                // Push to database
                await fetch("/api/cart", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ cart: parsedCart }),
                });
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch cart from database:", error);

          // If fetching fails, fall back to localStorage
          const localCart = localStorage.getItem("cart");
          if (localCart) {
            setCartState(JSON.parse(localCart));
          }
        }
      } else {
        // If user is not logged in, use localStorage
        const localCart = localStorage.getItem("cart");
        if (localCart) {
          setCartState(JSON.parse(localCart));
        } else {
          setCartState({ items: [], totalItems: 0, subTotalPrice: 0 });
        }
      }

      setLoading(false);
    };

    syncCart();
  }, [session, status]);

  // Listen for storage changes across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "cart" && event.newValue) {
        setCartState(JSON.parse(event.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <CartContext.Provider value={{ cart, setCart, loading }}>
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
