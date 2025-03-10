"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  id: string;
  title: string;
  condition: string;
  orderId: string;
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
  isLoading: boolean;
  syncCart: () => Promise<void>;
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

  // // This effect runs when the session status changes
  // useEffect(() => {
  //   const abortController = new AbortController();
  //   const signal = abortController.signal;

  //   const syncCart = async () => {
  //     setIsLoading(true);

  //     if (status === "loading") {
  //       return;
  //     }

  //     try {
  //       if (session) {
  //         const firstSync = localStorage.getItem("firstSyncDone");
  //         if (!firstSync) {
  //           const localCartJSON = localStorage.getItem("cart");

  //           if (localCartJSON) {
  //             const localCart = JSON.parse(localCartJSON);

  //             if (localCart?.items?.length) {
  //               const response = await fetch("/api/cart", {
  //                 method: "POST",
  //                 headers: { "Content-Type": "application/json" },
  //                 body: JSON.stringify({ cart: localCart }),
  //                 signal,
  //               });

  //               if (!response.ok) {
  //                 throw new Error(`Failed to sync cart: ${response.status}`);
  //               }

  //               const result = await response.json();

  //               if (result.cart) {
  //                 setCart(result.cart);
  //                 setIsLoading(false);
  //                 localStorage.setItem("firstSyncDone", "completed");
  //                 return;
  //               }
  //             }
  //           }
  //         }
  //         const response = await fetch("/api/cart", { signal });

  //         if (!response.ok) {
  //           throw new Error(`API responded with status: ${response.status}`);
  //         }

  //         const result = await response.json();

  //         if (result.cart) {
  //           setCart(result.cart);
  //         } else {
  //           setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
  //         }
  //       } else {
  //         // Check if this is a logout (previously had a session, now doesn't)
  //         const previouslyLoggedIn = localStorage.getItem("firstSyncDone");

  //         if (previouslyLoggedIn) {
  //           // Clear all cart-related items from localStorage on logout
  //           localStorage.removeItem("cart");
  //           localStorage.removeItem("firstSyncDone");
  //           // Set empty cart
  //           setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
  //         } else {
  //           try {
  //             const localCartJSON = localStorage.getItem("cart");

  //             if (localCartJSON) {
  //               const localCart = JSON.parse(localCartJSON);
  //               setCart(localCart);
  //             } else {
  //               setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
  //             }
  //           } catch (error) {
  //             console.error("Error parsing cart from localStorage:", error);
  //             setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       if (error instanceof Error && error.name === "AbortError") {
  //         console.log("Fetch aborted");
  //       } else {
  //         console.error("Failed to fetch or sync cart:", error);
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   syncCart();

  //   return () => {
  //     abortController.abort();
  //   };
  // }, [session, status]);

  // Extract syncCart as a memoized function using useCallback
  const syncCart = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);

      if (status === "loading") {
        // setIsLoading(false);
        return;
      }

      try {
        if (session) {
          const firstSync = localStorage.getItem("firstSyncDone");
          if (!firstSync) {
            const localCartJSON = localStorage.getItem("cart");

            if (localCartJSON) {
              const localCart = JSON.parse(localCartJSON);

              if (localCart?.items?.length) {
                const response = await fetch("/api/cart", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ cart: localCart }),
                });

                if (!response.ok) {
                  throw new Error(`Failed to sync cart: ${response.status}`);
                }

                const result = await response.json();

                if (result.cart) {
                  setCart(result.cart);
                  setIsLoading(false);
                  localStorage.setItem("firstSyncDone", "completed");
                  return;
                }
              }
            }
          }

          const response = await fetch("/api/cart", {
            signal: signal,
          });

          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }

          const result = await response.json();

          if (result.cart) {
            setCart(result.cart);
          } else {
            setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
          }
        } else {
          // Check if this is a logout (previously had a session, now doesn't)
          const previouslyLoggedIn = localStorage.getItem("firstSyncDone");

          if (previouslyLoggedIn) {
            // Clear all cart-related items from localStorage on logout
            localStorage.removeItem("cart");
            localStorage.removeItem("firstSyncDone");
            // Set empty cart
            setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
          } else {
            try {
              const localCartJSON = localStorage.getItem("cart");

              if (localCartJSON) {
                const localCart = JSON.parse(localCartJSON);
                setCart(localCart);
              } else {
                setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
              }
            } catch (error) {
              console.error("Error parsing cart from localStorage:", error);
              setCart({ items: [], totalItems: 0, subTotalPrice: 0 });
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Failed to fetch or sync cart:", error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [session, status]
  );

  useEffect(() => {
    const abortController = new AbortController();

    syncCart(abortController.signal).catch((error: unknown) => {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error in initial syncCart:", error);
      }
    });

    return () => {
      abortController.abort();
    };
  }, [syncCart]);

  // Listen for storage events (changes from other tabs)
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

  // Update localStorage when cart changes
  useEffect(() => {
    if (!isLoading && !localStorage.getItem("firstSyncDone")) {
      if (cart.items.length > 0) {
        localStorage.setItem("cart", JSON.stringify(cart));
      } else if (cart.items.length === 0 && localStorage.getItem("cart")) {
        localStorage.removeItem("cart");
      }
    }
  }, [cart, isLoading]);

  return (
    <CartContext.Provider value={{ cart, setCart, isLoading, syncCart }}>
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
