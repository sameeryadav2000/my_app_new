"use client";

import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  phoneModelDetailsId: number;
  phoneModelId: number;
  titleName?: string;
  condition: string;
  orderId?: string;
  sellerId: string;
  colorId: number;
  colorName?: string;
  storage: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subTotalPrice: number;
}

interface SyncCartResult {
  success: boolean;
  message: string;
}

interface CartContextType {
  cart: Cart;
  setCart: (cart: Cart) => void;
  isLoading: boolean;
  syncCart: () => Promise<SyncCartResult>;
  syncNotify: { success: boolean; message: string } | null;
  clearSyncNotify: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [syncNotify, setSyncNotify] = useState<{ success: boolean; message: string } | null>(null);

  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    subTotalPrice: 0,
  });

  const syncCart = useCallback(
    async (signal?: AbortSignal): Promise<SyncCartResult> => {
      if (status === "loading") {
        return {
          success: false,
          message: "",
        };
      }
      try {
        setIsLoading(true);

        if (session) {
          const firstSync = localStorage.getItem("firstSyncDone");

          if (!firstSync) {
            const localCartJSON = localStorage.getItem("cart");

            if (localCartJSON) {
              const localCart = JSON.parse(localCartJSON);

              if (localCart?.items?.length > 0) {
                const response = await fetch("/api/cart", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ cart: localCart }),
                });

                const result = await response.json();

                localStorage.setItem("firstSyncDone", "completed");
                localStorage.removeItem("cart");

                if (!result.success) {
                  setIsLoading(false);
                  return {
                    success: false,
                    message: result.message,
                  };
                }
              }
            }
          }

          const response = await fetch("/api/cart", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal,
          });

          const result = await response.json();

          if (!result.success) {
            setIsLoading(false);
            return {
              success: false,
              message: result.message || "Failed to retrieve cart from server",
            };
          }

          if (result.data) {
            setCart(result.data);
          } else {
            setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
          }

          setIsLoading(false);
          return {
            success: true,
            message: "Cart synced successfully",
          };
        } else {
          const previouslyLoggedIn = localStorage.getItem("firstSyncDone");
          if (previouslyLoggedIn) {
            localStorage.removeItem("firstSyncDone");
            setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
            setIsLoading(false);
            return {
              success: true,
              message: "Cart cleared after logout",
            };
          } else {
            try {
              const localCartJSON = localStorage.getItem("cart");

              if (localCartJSON) {
                const localCart = JSON.parse(localCartJSON);
                setCart(localCart);
                setIsLoading(false);
                return {
                  success: true,
                  message: "Local cart loaded successfully",
                };
              } else {
                setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
                setIsLoading(false);
                return {
                  success: true,
                  message: "Could not update cart",
                };
              }
            } catch (error) {
              console.error("Cart parsing error:", error);

              setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
              setIsLoading(false);
              return {
                success: false,
                message: "Error parsing local cart data",
              };
            }
          }
        }
      } catch (error) {
        console.error("Error syncing cart:", error);
        setIsLoading(false);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Unknown error occurred while syncing cart",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [session, status]
  );

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    syncCart(abortController.signal)
      .then((result) => {
        if (!isMounted) return;

        // Only capture error messages, not success messages
        if (!result.success && result.message) {
          setSyncNotify({
            success: false,
            message: result.message,
          });
        }
      })
      .catch((error) => {
        if (isMounted && error instanceof Error && error.name !== "AbortError") {
          setSyncNotify({
            success: false,
            message: error.message || "An unexpected error occurred",
          });
        }
      });

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [syncCart]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "cart" && event.newValue) {
        try {
          setCart(JSON.parse(event.newValue));
        } catch (error) {
          console.error("Error parsing cart from storage event:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        isLoading,
        syncCart,
        syncNotify,
        clearSyncNotify: () => setSyncNotify(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
