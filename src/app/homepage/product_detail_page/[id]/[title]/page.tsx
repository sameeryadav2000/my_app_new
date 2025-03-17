// src\app\homepage\product_detail_page\[id]\[title]\page.tsx

"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { CartItem, Cart } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";
// import Card from "../../../../components/CardsForPhone";
import AddToCartButton from "@/app/components/AddToCart";
// import StickyHeader from "@/app/components/StickyHeader";
import ReviewList from "@/app/components/ReviewList";
// import AverageRating from "@/app/components/AverageRating";

interface ConditionOption {
  condition: string;
}

interface StorageOption {
  storage: string;
}

interface Color {
  id: number;
  color: string;
}

interface ColorOption {
  id: number;
  color: Color;
  colorId: number;
  images: [];
  price: number;
  phoneId: number;
}

export default function ProductPage() {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();

  const params = useParams();
  const phoneModelId = params.id;
  const phoneModelName = (params.title as string).replace(/-/g, " ");

  const [selectedCondition, setSelectedCondition] = useState<string>("");
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  const [conditionOptions, setConditionOptions] = useState<ConditionOption[]>([]);
  const [storageOptions, setStorageOptions] = useState<StorageOption[]>([]);
  const [colorOptions, setColorOptions] = useState<ColorOption[]>([]);

  const [priceSelected, setPriceSelected] = useState<number>(0);
  const [phoneId, setPhoneId] = useState<string>("");
  const [modelImages, setModelImages] = useState<string[]>([]);

  const [prevSelectedCondition, setPrevSelectedCondition] = useState<string>("");
  const [prevSelectedStorage, setPrevSelectedStorage] = useState<string>("");
  const [prevSelectedColor, setPrevSelectedColor] = useState<string>("");

  const isFirstRender = useRef(true);

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const colors: Record<string, string> = {
    Black: "bg-black",
    Red: "bg-red-400",
    Blue: "bg-blue-400",
    Green: "bg-green-400",
    Pink: "bg-pink-300",
  };

  useEffect(() => {
    const fetchIphoneModels = async () => {
      showLoading();

      try {
        const response = await fetch(
          `/api/phone_model_details?id=${phoneModelId}&condition=${selectedCondition}&storage=${selectedStorage}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!result.success) {
          showError("Error", result.message);
          return;
        }

        if (!selectedCondition) {
          setConditionOptions(result.data);
        } else if (!selectedStorage && selectedCondition) {
          setStorageOptions(result.data);
        } else if (!selectedColor && selectedCondition) {
          setColorOptions(result.data);
        }
      } catch (error) {
        showError("Error", "Failed to load phone model details. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchIphoneModels();
  }, [selectedCondition, selectedStorage]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (conditionOptions.length > 0 && selectedCondition === "") {
      if (conditionOptions.some((option) => option.condition === prevSelectedCondition)) {
        setSelectedCondition(prevSelectedCondition);
      } else {
        setSelectedCondition(conditionOptions[0].condition);
      }
    } else if (storageOptions.length > 0 && selectedStorage === "") {
      if (storageOptions.some((option) => option.storage === prevSelectedStorage)) {
        setSelectedStorage(prevSelectedStorage);
      } else {
        setSelectedStorage(storageOptions[0].storage);
      }
    } else if (colorOptions.length > 0 && selectedColor === "") {
      if (colorOptions.some((option) => option.color.color === prevSelectedColor)) {
        setSelectedColor(prevSelectedColor);
      } else {
        setSelectedColor(colorOptions[0].color.color);
      }
    }
  }, [conditionOptions, storageOptions, colorOptions]);

  useEffect(() => {
    if (selectedColor) {
      const option = colorOptions.find((opt) => opt.color.color === selectedColor);

      if (option) {
        setPriceSelected(option.price);
        setPhoneId(option.id.toString());
        setModelImages(option.images);
      }
    }
  }, [selectedColor]);

  const nextImage = () => {
    if (modelImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % modelImages.length);
  };

  const prevImage = () => {
    if (modelImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + modelImages.length) % modelImages.length);
  };

  const handleConditionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrevSelectedStorage(selectedStorage);
    setPrevSelectedColor(selectedColor);

    setSelectedStorage("");
    setSelectedColor("");

    setSelectedCondition(event.target.value);
  };

  const handleStorageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrevSelectedCondition(selectedCondition);
    setPrevSelectedColor(selectedColor);

    setSelectedCondition("");
    setSelectedColor("");

    setSelectedStorage(event.target.value);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(event.target.value);
  };

  const { data: session } = useSession();
  const { setCart } = useCart(); // Access cart and setCart

  const router = useRouter();

  const handleAddToCart = async () => {
    const imageToUse = modelImages && modelImages.length > 0 ? modelImages[0].image : "";

    // // Create a new cart item from the selected options
    const newItem: CartItem = {
      id: phoneId,
      title: phoneModelName,
      condition: selectedCondition.charAt(0).toUpperCase() + selectedCondition.slice(1),
      storage: selectedStorage,
      color: selectedColor,
      price: priceSelected || 0,
      quantity: 1,
      image: imageToUse,
    };

    // Get existing cart from localStorage
    const existingCartJson = localStorage.getItem("cart");
    const existingCart: Cart = existingCartJson ? JSON.parse(existingCartJson) : { items: [], totalItems: 0, subTotalPrice: 0 };

    // Check if this exact item configuration already exists
    const existingItemIndex = existingCart.items.findIndex(
      (item) =>
        item.id === newItem.id && item.condition === newItem.condition && item.storage === newItem.storage && item.color === newItem.color
    );

    let updatedCart: Cart;

    if (existingItemIndex > -1) {
      // If item exists, increment its quantity
      const updatedItems = existingCart.items.map((item, index) =>
        index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
      updatedCart = {
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        subTotalPrice: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };
    } else {
      // If item doesn't exist, add it to cart
      updatedCart = {
        items: [...existingCart.items, newItem],
        totalItems: existingCart.totalItems + 1,
        subTotalPrice: existingCart.subTotalPrice + newItem.price,
      };
    }

    if (session) {
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cartItem: newItem }),
        });

        if (!response.ok) {
          throw new Error(`Failed to sync cart: ${response.status}`);
        }

        const result = await response.json();

        if (result.cart) {
          setCart(result.cart);
        }
      } catch (error) {
        console.error("Error saving cart item:", error);
        // Handle error appropriately
      }
    } else {
      setCart(updatedCart);
    }
  };

  return (
    <div>
      {/* <StickyHeader
        title={phoneModelName}
        condition={selectedCondition}
        storage={selectedStorage}
        color={selectedColor}
        price={priceSelected}
        originalPrice={629.0}
        savings={348.9}
        imageSrc="../../../sticky_header_images/image.png"
      /> */}

      {/* Main div */}
      <div className="w-[95%] md:w-[70%] mx-auto mx-auto">
        {/* Div into two columns */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side container box */}
          <div className="w-full md:w-1/2 bg-white rounded-lg">
            <div className="md:w-full md:h-screen md:sticky md:top-10">
              <div className="h-auto md:h-full flex flex-col justify-center">
                <div className="relative h-[300px] md:h-[500px] w-full mb-4 bg-white">
                  {modelImages.length > 0 ? (
                    <img
                      src={modelImages[currentImageIndex]}
                      alt={`${selectedColor} iPhone - View ${currentImageIndex + 1}`}
                      className="absolute inset-0 h-full w-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Images</div>
                  )}
                  <button
                    onClick={prevImage}
                    disabled={modelImages.length <= 1}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg transition-all duration-200 border border-gray-200 text-gray-800 hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    aria-label="Previous image"
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

                  <button
                    onClick={nextImage}
                    disabled={modelImages.length <= 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg transition-all duration-200 border border-gray-200 text-gray-800 hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    aria-label="Next image"
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

                <div className="flex gap-2 overflow-x-auto justify-center">
                  {modelImages.map((imagePath, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2
                  ${currentImageIndex === index ? "border-blue-500" : "border-transparent"}`}
                    >
                      <img src={imagePath} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side container box */}
          <div className="w-full md:w-1/2 bg-white rounded-lg">
            {/* Info First Section */}
            <div className="md:w-full md:h-screen flex pb-5 flex-col justify-center">
              <h1 className="text-2xl font-bold mb-4">
                {phoneModelName} {selectedStorage} - {selectedColor} - Unlocked
              </h1>

              <div className="mb-6">
                <div className="flex items-baseline justify-between w-full">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">${priceSelected}</span>
                  </div>
                  <AddToCartButton className="!w-40" onClick={handleAddToCart} />
                </div>
              </div>
            </div>

            {/* Condition Section */}
            <div className="md:w-full md:h-screen flex pb-10 flex-col justify-center">
              <h2 className="font-bold mb-6">Select the condition</h2>

              <div className="grid grid-cols-2 gap-4">
                {conditionOptions.length > 0 ? (
                  conditionOptions.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-4 p-2 border rounded-lg cursor-pointer 
                                transition-all duration-200 ease-in-out
                                ${
                                  selectedCondition === option.condition
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-500"
                                }`}
                    >
                      <input
                        type="radio"
                        name="condition"
                        className="h-4 w-4"
                        value={option.condition}
                        checked={selectedCondition === option.condition}
                        onChange={handleConditionChange}
                      />
                      <div className="flex flex-col">
                        <span className="capitalize">{option.condition}</span>
                        {selectedCondition === option.condition && selectedColor ? (
                          <span className="text-gray-600 text-sm mt-1">
                            ${colorOptions.find((opt) => opt.color.color === selectedColor)?.price || "—"}
                          </span>
                        ) : (
                          <span className="inline-block w-14 h-4 mt-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded"></span>
                        )}
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="col-span-full text-gray-500">No condition options available</p>
                )}
              </div>
            </div>

            {/* Storage Section */}
            <div className="md:w-full md:h-screen flex pb-10 flex-col justify-center">
              <h2 className="font-bold mb-6">Select storage</h2>

              <div className="flex flex-col gap-4">
                {storageOptions.length > 0 ? (
                  storageOptions.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-blue-500"
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="storage"
                          className="h-4 w-4"
                          value={option.storage}
                          checked={selectedStorage === option.storage}
                          onChange={handleStorageChange}
                        />
                        <span className="">{option.storage}</span>
                      </div>
                      {selectedStorage === option.storage && selectedColor ? (
                        <span className="text-gray-600 text-sm mt-1">
                          ${colorOptions.find((opt) => opt.color.color === selectedColor)?.price || "—"}
                        </span>
                      ) : (
                        <span className="inline-block w-14 h-4 mt-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded"></span>
                      )}
                    </label>
                  ))
                ) : (
                  <p className="col-span-full text-gray-500">No storage options available</p>
                )}
              </div>
            </div>

            {/* Color Section */}
            <div className="md:w-full md:h-screen flex pb-10 flex-col justify-center">
              <h2 className="font-bold mb-6">Select the color</h2>

              <div className="grid grid-cols-2 gap-2 w-full">
                {colorOptions.length > 0 ? (
                  colorOptions.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-4 p-2 border rounded-lg cursor-pointer 
                                transition-all duration-200 ease-in-out
                                ${
                                  selectedColor === option.color.color
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-500"
                                }`}
                    >
                      <input
                        type="radio"
                        name="color"
                        className="h-4 w-4"
                        value={option.color.color}
                        checked={selectedColor === option.color.color}
                        onChange={handleColorChange}
                      />
                      <div className={`w-4 h-4 rounded-full ${colors[option.color.color as keyof typeof colors] || ""}`}></div>

                      <div className="flex flex-col">
                        <span className="text-gray-700">{option.color.color}</span>
                        <span className="text-gray-500">${option.price}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="col-span-full text-gray-500">No condition options available</p>
                )}
              </div>
            </div>

            {/* Last Section */}
            {/* <div className="md:w-full md:h-screen flex flex-col justify-center">
              <div className="max-w-2xl">
                <div className="flex justify-between items-start mb-6">
                  <h1 className="font-bold">Tadaaa</h1>
                </div>

                <div className="border rounded-lg p-6 mb-4 bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <h2>{phoneModelName} - Unlocked</h2>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 border capitalize">{selectedCondition}</span>
                    <span className="px-3 py-1 border">{selectedStorage}</span>
                    <span className="px-3 py-1 border">{selectedColor}</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <h2 className="font-bold">$ {priceSelected}</h2>
                  </div>
                </div>

                <AddToCartButton className="w-full" onClick={handleAddToCart} />
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {phoneId && (
        <div className="md:w-4/5 w-[90%] mx-auto py-8 mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ReviewList modelId={Number(phoneId)} />
          </div>
        </div>
      )}
    </div>
  );
}
