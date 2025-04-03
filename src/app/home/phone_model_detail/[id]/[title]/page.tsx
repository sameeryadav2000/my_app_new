// src\app\home\phone_model_detail\[id]\[title]\page.tsx

"use client";

import FullScreenLoader from "@/src/app/components/FullScreenLoader";
import { useLoading } from "@/src/context/LoadingContext";
import { useNotification } from "@/src/context/NotificationContext";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { CartItem, Cart } from "@/src/context/CartContext";
import { useCart } from "@/src/context/CartContext";
import StickyHeader from "@/src/app/components/StickyHeader";
import ReviewList from "@/src/app/components/ReviewList";
import { formatNPR } from "@/src/utils/formatters";
import Image from "next/image";

interface Products {
  id: number;
  phoneModelId: number;
  condition: string;
  storage: string;
  colorId: number | null;
  colorName: string;
  price: number;
  sellerId: string | null;
  sellerName: string | null;
  phoneName: string;
  phoneModel: string;
  images: ProductImage[];
}

interface ProductImage {
  image: string;
  mainImage: boolean;
}

export default function ProductPage() {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError } = useNotification();

  const params = useParams();
  const phoneModelId = Number(params.id);

  const [filteredProducts, setFilteredProducts] = useState<Products[]>([]);

  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const [reviewData, setReviewData] = useState({ averageRating: 0, reviewCount: 0 });

  const colors: Record<string, string> = {
    Black: "bg-black",
    White: "bg-gray-100",
    Gray: "bg-gray-400",
    Silver: "bg-gray-300",
    Gold: "bg-yellow-600",
    Blue: "bg-blue-400",
    Red: "bg-red-400",
    Green: "bg-green-400",
    Yellow: "bg-yellow-400",
    Purple: "bg-purple-400",
    Pink: "bg-pink-300",
    Orange: "bg-orange-400",
  };

  // In your component file
  useEffect(() => {
    let isMounted = true;

    const fetchAllProducts = async () => {
      showLoading();

      try {
        const response = await fetch(`/api/phone_model_details?id=${phoneModelId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!isMounted) return;

        if (!result.success) {
          showError("Error", result.message);
          return;
        }

        const lowestPriceMap = new Map<string, Products>();

        result.data.forEach((product: Products) => {
          const key = `${product.condition}-${product.storage}`;

          if (!lowestPriceMap.has(key) || product.price < lowestPriceMap.get(key)!.price) {
            lowestPriceMap.set(key, product);
          }
        });

        const lowestPriceProducts = Array.from(lowestPriceMap.values());
        setFilteredProducts(lowestPriceProducts);

        // Auto-select first variation
        if (lowestPriceProducts.length > 0) {
          setSelectedVariationId(lowestPriceProducts[0].id);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load phone variations:", error);
        showError("Error", "Failed to load product details. Please check your connection and try again.");
      } finally {
        if (isMounted) {
          hideLoading();
        }
      }
    };

    fetchAllProducts();

    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, [phoneModelId, showError, hideLoading, showLoading]);

  const selectedVariation = useMemo(() => {
    if (!selectedVariationId) return null;
    return filteredProducts.find((p) => p.id === selectedVariationId) || null;
  }, [filteredProducts, selectedVariationId]);

  const modelImages = useMemo(() => {
    return selectedVariation?.images || [];
  }, [selectedVariation]);

  const availableConditions = useMemo(() => {
    const conditions = [...new Set(filteredProducts.map((p) => p.condition))];
    return conditions;
  }, [filteredProducts]);

  const availableStorageOptions = useMemo(() => {
    if (!selectedVariation) return [];
    const condition = selectedVariation.condition;
    return [...new Set(filteredProducts.filter((p) => p.condition === condition).map((p) => p.storage))];
  }, [filteredProducts, selectedVariation]);

  const availableColorOptions = useMemo(() => {
    if (!selectedVariation) return [];
    const condition = selectedVariation.condition;
    const storage = selectedVariation.storage;
    return filteredProducts
      .filter((p) => p.condition === condition && p.storage === storage)
      .map((p) => ({
        id: p.id,
        colorId: p.colorId,
        colorName: p.colorName,
        price: p.price,
      }));
  }, [filteredProducts, selectedVariation]);

  const nextImage = () => {
    if (modelImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % modelImages.length);
  };

  const prevImage = () => {
    if (modelImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + modelImages.length) % modelImages.length);
  };

  const handleConditionChange = (condition: string) => {
    const firstMatchingVariation = filteredProducts.find((p) => p.condition === condition);
    if (firstMatchingVariation) {
      setSelectedVariationId(firstMatchingVariation.id);
      setCurrentImageIndex(0);
    }
  };

  const handleStorageChange = (storage: string) => {
    if (!selectedVariation) return;
    const firstMatchingVariation = filteredProducts.find((p) => p.condition === selectedVariation.condition && p.storage === storage);
    if (firstMatchingVariation) {
      setSelectedVariationId(firstMatchingVariation.id);
      setCurrentImageIndex(0);
    }
  };
  // Handle color change
  const handleColorChange = (variationId: number) => {
    setSelectedVariationId(variationId);
    setCurrentImageIndex(0); // Reset image index
  };

  const { data: session } = useSession();
  const { syncCart, syncNotify, clearSyncNotify } = useCart();

  const imageToUse = useMemo(() => {
    if (!modelImages || modelImages.length === 0) return "";
    const mainImage = modelImages.find((img) => img.mainImage);
    return mainImage ? mainImage.image : modelImages[0].image; // Fallback to first image if no main image
  }, [modelImages]);

  const handleAddToCart = async () => {
    if (!selectedVariation) return;

    // Ensure all required fields are available
    const newItem: CartItem = {
      phoneModelDetailsId: selectedVariation.id,
      phoneModelId: phoneModelId,
      condition: selectedVariation.condition
        ? selectedVariation.condition.charAt(0).toUpperCase() + selectedVariation.condition.slice(1)
        : "",
      storage: selectedVariation.storage,
      colorId: selectedVariation.colorId || 0,
      price: selectedVariation.price || 0,
      sellerId: selectedVariation.sellerId || "",
      quantity: 1,
      image: imageToUse,
    };

    const existingCartJson = localStorage.getItem("cart");
    const existingCart: Cart = existingCartJson ? JSON.parse(existingCartJson) : { items: [], totalItems: 0, subTotalPrice: 0 };

    const existingItemIndex = existingCart.items.findIndex(
      (item) =>
        item.phoneModelDetailsId === newItem.phoneModelDetailsId &&
        item.condition === newItem.condition &&
        item.storage === newItem.storage &&
        item.colorId === newItem.colorId &&
        item.sellerId === newItem.sellerId
    );

    let updatedCart: Cart;

    if (existingItemIndex > -1) {
      const updatedItems = existingCart.items.map((item, index) =>
        index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
      updatedCart = {
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        subTotalPrice: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };
    } else {
      updatedCart = {
        items: [...existingCart.items, newItem],
        totalItems: existingCart.totalItems + 1,
        subTotalPrice: existingCart.subTotalPrice + newItem.price,
      };
    }

    if (session) {
      try {
        showLoading();

        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cartItem: newItem }),
        });

        const result = await response.json();

        if (!result.success) {
          showError("Error", result.message);
          return;
        }

        const syncCartResult = await syncCart();

        if (syncCartResult.success) {
          showSuccess("Success", syncCartResult.message);
        }
        // else {
        //   showError("Error", syncCartResult.message);
        // }
      } catch (error) {
        console.error("Failed to save cart: ", error);

        showError("Error", "Failed to save cart. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    } else {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      const syncCartResult = await syncCart();

      if (syncCartResult.success) {
        showSuccess("Success", syncCartResult.message);
      }
      // else {
      //   showError("Error", syncCartResult.message);
      // }
    }
  };

  useEffect(() => {
    if (syncNotify && !syncNotify.success) {
      // Only show error notifications, ignore success ones
      showError("Cart Sync Error", syncNotify.message);
      // Clear the notification after displaying
      clearSyncNotify();
    }
  }, [syncNotify, showError, clearSyncNotify]);

  // Add this function inside your component but before the return statement
  const getDeliveryDateRange = (): string => {
    const today: Date = new Date();
    const deliveryStart: Date = new Date(today);
    deliveryStart.setDate(today.getDate() + 7);
    const deliveryEnd: Date = new Date(today);
    deliveryEnd.setDate(today.getDate() + 8);

    const formatDate = (date: Date): string => {
      const month: string = date.toLocaleString("en-US", { month: "short" });
      const day: number = date.getDate();
      return `${month} ${day}`;
    };

    return `${formatDate(deliveryStart)} - ${formatDate(deliveryEnd)}`;
  };

  useEffect(() => {
    // Reset when a new color is selected
    setReviewData({ averageRating: 0, reviewCount: 0 });
  }, [selectedVariation?.colorId, phoneModelId]);

  return (
    <div>
      {isLoading && <FullScreenLoader />}

      <StickyHeader
        title={selectedVariation?.phoneName || ""}
        condition={selectedVariation?.condition || ""}
        storage={selectedVariation?.storage || ""}
        color={selectedVariation?.colorName || ""}
        price={selectedVariation?.price || 0}
        image={imageToUse}
        onAddToCart={handleAddToCart}
      />

      {/* Main div */}
      <div className="w-[95%] md:w-[70%] mx-auto">
        {/* Div into two columns */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side container box */}
          <div className="w-full lg:w-1/2 bg-white rounded-lg">
            <div className="lg:w-full lg:h-auto lg:sticky lg:top-20 max-w-lg mx-auto">
              <div className="h-auto flex flex-col justify-center py-4">
                <div className="relative h-[250px] md:h-[400px] w-full mb-4">
                  {modelImages && modelImages.length > 0 ? (
                    <div className="absolute inset-0">
                      <Image
                        src={modelImages[currentImageIndex].image}
                        alt={`${selectedVariation?.colorName || ""} ${selectedVariation?.phoneModel || ""} - View ${currentImageIndex + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        style={{ objectFit: "contain" }}
                        className="rounded-lg"
                        priority={true}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-black">No Images</div>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={prevImage}
                    disabled={!modelImages || modelImages.length <= 1}
                    className="bg-black p-2.5 rounded-full shadow-lg transition-all duration-200 border border-black text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 mx-2"
                    aria-label="Previous thumbnail"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>

                  <div className="flex gap-2 overflow-x-auto max-w-[80%]">
                    {modelImages &&
                      modelImages.map((imageObj, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2
                    ${currentImageIndex === index ? "border-black" : "border-transparent"}`}
                        >
                          <div className="relative h-full w-full">
                            <Image src={imageObj.image} alt={`Thumbnail ${index + 1}`} fill sizes="64px" style={{ objectFit: "cover" }} />
                          </div>
                        </button>
                      ))}
                  </div>

                  <button
                    onClick={nextImage}
                    disabled={!modelImages || modelImages.length <= 1}
                    className="bg-black p-2.5 rounded-full shadow-lg transition-all duration-200 border border-black text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 mx-2"
                    aria-label="Next thumbnail"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right side container box */}
          <div className="w-full lg:w-1/2">
            {/* Info First Section */}
            <div className="lg:w-full lg:h-[60vh] flex pb-5 flex-col justify-center">
              <h1 className="text-base lg:text-xl font-bold mb-4 text-black tracking-tight">
                {selectedVariation?.phoneModel} {selectedVariation?.storage} - {selectedVariation?.colorName}
              </h1>

              {/* Rating Display */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 ${
                        i < Math.floor(reviewData.averageRating) ? "text-black fill-black" : "text-gray-200 fill-gray-200"
                      }`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  ))}
                </div>
                {reviewData.reviewCount > 0 ? (
                  <span className="text-xs lg:text-sm text-gray-600">
                    {reviewData.averageRating.toFixed(1)}/5 ({reviewData.reviewCount} {reviewData.reviewCount === 1 ? "review" : "reviews"})
                  </span>
                ) : (
                  <span className="text-xs lg:text-sm text-gray-600">No reviews yet</span>
                )}
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-baseline">
                    <span className="text-base lg:text-xl font-bold tracking-tight">
                      {selectedVariation && formatNPR(selectedVariation.price)}
                    </span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isLoading}
                    className="bg-black hover:bg-black text-white px-4 py-2 lg:px-5 lg:py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 shadow-sm text-xs lg:text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                      <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Add to cart
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 lg:gap-3">
                  <div className="bg-gradient-to-br from-indigo-50 to-white p-1.5 lg:p-2 rounded-lg border border-black flex items-center text-center transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="bg-indigo-100 p-1 lg:p-1.5 rounded-full mr-1 lg:mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 lg:h-4 lg:w-4 text-indigo-800"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-medium">6-Month Warranty</span>
                  </div>

                  <div className="bg-gradient-to-br from-rose-50 to-white p-1.5 lg:p-2 rounded-lg border border-black flex items-center text-center transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="bg-rose-100 p-1 lg:p-1.5 rounded-full mr-1 lg:mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 lg:h-4 lg:w-4 text-rose-800"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-medium">30-Day Returns</span>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-white p-1.5 lg:p-2 rounded-lg border border-black flex items-center text-center transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="bg-amber-100 p-1 lg:p-1.5 rounded-full mr-1 lg:mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 lg:h-4 lg:w-4 text-amber-800"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-medium">Free Shipping</span>
                  </div>
                </div>
              </div>

              {/* Refurbished Banner */}
              <div className="mb-4">
                <div className="bg-gradient-to-r from-white to-white rounded-lg p-2.5 lg:p-3 border border-black relative overflow-hidden">
                  {/* Abstract background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-blue-500 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-36 h-36 lg:w-48 lg:h-48 bg-purple-500 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-xl"></div>
                  </div>
                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="bg-black p-1.5 lg:p-2 rounded">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3.5 h-3.5 lg:w-4 lg:h-4"
                        >
                          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                      </div>
                      <div className="tracking-tight">
                        <p className="font-medium text-xs lg:text-sm">Factory Renewed - Premium Performance</p>
                        <p className="text-black text-xs">Fully tested & certified with 6-month warranty.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="p-1 lg:p-1.5 bg-green-100 rounded text-xs">
                    <span className="text-green-800 font-medium tracking-tight text-xs">Save up to 40%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Condition Selection */}
            <div className="lg:w-full lg:h-[60vh] flex pb-8 flex-col justify-center tracking-tight">
              <h2 className="text-base lg:text-xl font-bold mb-4 text-black tracking-tight">Select the condition</h2>

              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {["New", "Excellent", "Good", "Fair"].map((condition, index) => {
                  const isAvailable = availableConditions.includes(condition);
                  const isNew = condition === "New";
                  const isSelected = selectedVariation?.condition === condition;

                  return (
                    <label
                      key={index}
                      className={`flex flex-col border rounded-lg overflow-hidden
                transition-all duration-200 ease-in-out
                ${!isAvailable ? "opacity-70 bg-gray-100 border-gray-300 cursor-not-allowed" : "cursor-pointer"}
                ${isSelected && isAvailable ? "border-black bg-white" : "border-black hover:border-black"}`}
                    >
                      {isNew && isAvailable && (
                        <div className="w-full bg-black text-white text-xs text-center py-0.5 font-medium">
                          <span className="inline-block mr-1">✨</span>
                          Brand New
                          <span className="inline-block ml-1">✨</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2">
                        <input
                          type="radio"
                          name="condition"
                          className="h-3 w-3 lg:h-4 lg:w-4 accent-black"
                          value={condition}
                          checked={isSelected}
                          onChange={() => handleConditionChange(condition)}
                          disabled={!isAvailable}
                        />

                        <div className="flex flex-col">
                          <span className={`text-sm lg:text-base capitalize ${!isAvailable ? "line-through" : ""}`}>{condition}</span>
                          {isSelected && isAvailable ? (
                            <span className="text-black text-sm lg:text-base mt-0.5 lg:mt-1">{formatNPR(selectedVariation.price)}</span>
                          ) : isAvailable ? (
                            <span className="inline-block w-12 lg:w-14 h-3 lg:h-4 mt-0.5 lg:mt-1 bg-gradient-to-r from-blue-100 via-white to-blue-100 animate-pulse rounded"></span>
                          ) : (
                            <span className="text-gray-500 text-xs mt-0.5 lg:mt-1">Not Available</span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              <div className="h-4 lg:h-6"></div>

              <div className="bg-blue-50 rounded-xl p-3 lg:p-4 mb-3 lg:mb-4 tracking-tight">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 lg:h-6 lg:w-6 text-blue-700"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs lg:text-sm text-black">
                        All devices undergo a rigorous 30-point testing process to ensure premium quality. Compare conditions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Section */}
            <div className="lg:w-full lg:h-[60vh] flex pb-8 flex-col justify-center">
              <h2 className="text-base lg:text-xl font-bold mb-4 text-black tracking-tight">Select storage</h2>

              <div className="flex flex-col gap-3 lg:gap-4">
                {availableStorageOptions.length > 0 ? (
                  availableStorageOptions.map((storage, index) => (
                    <label
                      key={index}
                      className={`flex items-center justify-between p-2.5 lg:p-3 border rounded-lg cursor-pointer transition-all duration-200 tracking-tight
                ${selectedVariation?.storage === storage ? "border-black bg-white" : "border-black hover:border-black"}`}
                    >
                      <div className="flex items-center gap-2 lg:gap-3">
                        <input
                          type="radio"
                          name="storage"
                          className="h-3 w-3 lg:h-4 lg:w-4 accent-black"
                          value={storage}
                          checked={selectedVariation?.storage === storage}
                          onChange={() => handleStorageChange(storage)}
                        />
                        <span className="text-sm lg:text-base tracking-tight">{storage}</span>
                      </div>
                      {selectedVariation?.storage === storage ? (
                        <span className="text-black text-sm lg:text-base mt-0.5 lg:mt-1 tracking-tight">
                          {formatNPR(selectedVariation.price)}
                        </span>
                      ) : (
                        <span className="inline-block w-12 lg:w-14 h-3 lg:h-4 mt-0.5 lg:mt-1 bg-gradient-to-r from-blue-100 via-white to-blue-100 animate-pulse rounded"></span>
                      )}
                    </label>
                  ))
                ) : (
                  <p className="col-span-full text-black text-sm lg:text-base tracking-tight">No storage options available</p>
                )}
              </div>
            </div>

            {/* Color Section */}
            <div className="lg:w-full lg:h-[60vh] flex pb-8 flex-col justify-center">
              <h2 className="text-base lg:text-xl font-bold mb-4 text-black tracking-tight">Select the color</h2>

              <div className="grid grid-cols-2 gap-1.5 lg:gap-2 w-full">
                {availableColorOptions.length > 0 ? (
                  availableColorOptions.map((colorOption, index) => {
                    const colorClass = colors[colorOption.colorName] || "bg-gray-200";
                    const isSelected = selectedVariation?.id === colorOption.id;

                    return (
                      <label
                        key={index}
                        className={`flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 border rounded-lg cursor-pointer
                  transition-all duration-200 ease-in-out
                  ${isSelected ? "border-black bg-white" : "border-black hover:border-black"}`}
                      >
                        <input
                          type="radio"
                          name="color"
                          className="h-3 w-3 lg:h-4 lg:w-4 accent-black"
                          value={colorOption.id}
                          checked={isSelected}
                          onChange={() => handleColorChange(colorOption.id)}
                        />
                        <div className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${colorClass}`}></div>

                        <div className="flex flex-col">
                          <span className="text-sm lg:text-base text-black capitalize">{colorOption.colorName}</span>
                          <span className="text-sm lg:text-base text-black">{formatNPR(colorOption.price)}</span>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <p className="col-span-full text-black text-sm lg:text-base">No color options available</p>
                )}
              </div>
            </div>

            {/* Last Section */}
            <div className="lg:w-full lg:h-[60vh] flex flex-col justify-center tracking-tight">
              <div className="max-w-2xl">
                <div className="flex justify-between items-start mb-4 text-black">
                  <h1 className="text-base lg:text-xl font-bold">Your Dream Device</h1>
                </div>
                <div className="border rounded-lg p-4 lg:p-5 mb-3 lg:mb-4 bg-white shadow-sm">
                  <div className="flex items-center gap-1.5 lg:gap-2 mb-3 lg:mb-4">
                    <h2 className="text-base lg:text-lg">{selectedVariation?.phoneModel}</h2>
                  </div>

                  <div className="flex gap-1.5 lg:gap-2 mb-3 lg:mb-4">
                    <span className="px-2 lg:px-3 py-0.5 lg:py-1 text-sm lg:text-base border capitalize bg-white rounded-md">
                      {selectedVariation?.condition}
                    </span>
                    <span className="px-2 lg:px-3 py-0.5 lg:py-1 text-sm lg:text-base border bg-white rounded-md">
                      {selectedVariation?.storage}
                    </span>
                    <span className="px-2 lg:px-3 py-0.5 lg:py-1 text-sm lg:text-base border bg-white rounded-md">
                      {selectedVariation?.colorName}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 lg:gap-2">
                    <h2 className="text-base lg:text-lg font-bold">{formatNPR(selectedVariation?.price)}</h2>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-black hover:bg-black text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm text-xs lg:text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                    <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Add to cart
                </button>
                <div className="mb-3 lg:mb-4 mt-3 lg:mt-4">
                  <div className="flex items-center p-2 lg:p-3 bg-blue-50 rounded-lg mb-1.5 lg:mb-2 text-xs lg:text-sm">
                    <span className="mr-2 lg:mr-3">🚚</span>
                    <span>Free delivery by {getDeliveryDateRange()}</span>
                  </div>

                  <div className="flex items-center p-2 lg:p-3 bg-blue-50 rounded-lg text-xs lg:text-sm">
                    <span className="mr-2 lg:mr-3">🛡️</span>
                    <span>Free 30-day returns</span>
                  </div>

                  <div className="flex items-center p-2 lg:p-3 bg-blue-50 rounded-lg mt-1.5 lg:mt-2 text-xs lg:text-sm">
                    <span className="mr-2 lg:mr-3">⏱️</span>
                    <span>6-month warranty</span>
                  </div>
                </div>
                <div className="mt-2 lg:mt-3 text-xs lg:text-sm text-black">
                  Proudly refurbished by <span className="font-medium">{selectedVariation?.sellerName}</span> 🇳🇵
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-10 mt-12 w-full">
        <div className="w-[95%] md:w-[70%] mx-auto">
          <div className="border-b border-gray-300 pb-3 md:pb-3.5 lg:pb-4 mb-4 md:mb-5 lg:mb-6">
            <h1 className="text-xl md:text-xl lg:text-2xl font-bold mb-0.5 md:mb-0.5 lg:mb-1">Customer Reviews</h1>
            {selectedVariation?.phoneModel && selectedVariation?.storage && selectedVariation?.colorName && (
              <p className="text-sm md:text-lg lg:text-lg text-gray-600">
                <span className="font-medium">{selectedVariation?.phoneModel}</span> • {selectedVariation?.storage} •{" "}
                <span className="capitalize">{selectedVariation?.colorName}</span>
              </p>
            )}
          </div>

          {selectedVariation?.colorId && (
            <ReviewList phoneModelId={phoneModelId} colorId={selectedVariation?.colorId} onReviewDataLoaded={setReviewData} />
          )}
        </div>
      </div>
    </div>
  );
}
