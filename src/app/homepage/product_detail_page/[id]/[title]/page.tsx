// src\app\homepage\product_detail_page\[id]\[title]\page.tsx

"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { CartItem, Cart } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";
import StickyHeader from "@/app/components/StickyHeader";
import ReviewList from "@/app/components/ReviewList";

interface ConditionOption {
  condition: string;
}

interface StorageOption {
  storage: string;
}

interface ColorOption {
  id: number;
  colorName: string;
  colorId: number;
  images: {
    image: string;
    mainImage: boolean;
  }[];
  price: number;
  phoneId: number;
  idForReview: number;
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
  const [idForReview, setIdForReview] = useState<number>(0);
  const [colorId, setColorId] = useState<number>(0);
  const [modelImages, setModelImages] = useState<{ image: string; mainImage: boolean }[]>([]);

  const [prevSelectedCondition, setPrevSelectedCondition] = useState<string>("");
  const [prevSelectedStorage, setPrevSelectedStorage] = useState<string>("");
  const [prevSelectedColor, setPrevSelectedColor] = useState<string>("");

  const isFirstRender = useRef(true);

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const colors: Record<string, string> = {
    Black: "bg-black",
    White: "bg-white",
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
      if (colorOptions.some((option) => option.colorName === prevSelectedColor)) {
        setSelectedColor(prevSelectedColor);
      } else {
        setSelectedColor(colorOptions[0].colorName);
      }
    }
  }, [conditionOptions, storageOptions, colorOptions]);

  useEffect(() => {
    if (selectedColor) {
      const option = colorOptions.find((opt) => opt.colorName === selectedColor);

      if (option) {
        setColorId(option.colorId);
        setIdForReview(option.idForReview);
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
  const { syncCart } = useCart();

  const imageToUse = modelImages.find((img) => img.mainImage)?.image;

  const handleAddToCart = async () => {
    if (!phoneModelId || Array.isArray(phoneModelId)) {
      return;
    }

    const newItem: CartItem = {
      id: phoneId,
      titleId: phoneModelId,
      condition: selectedCondition.charAt(0).toUpperCase() + selectedCondition.slice(1),
      storage: selectedStorage,
      colorId: colorId,
      price: priceSelected,
      quantity: 1,
      image: imageToUse || "",
    };

    const existingCartJson = localStorage.getItem("cart");
    const existingCart: Cart = existingCartJson ? JSON.parse(existingCartJson) : { items: [], totalItems: 0, subTotalPrice: 0 };

    const existingItemIndex = existingCart.items.findIndex(
      (item) =>
        item.id === newItem.id &&
        item.condition === newItem.condition &&
        item.storage === newItem.storage &&
        item.colorId === newItem.colorId
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
        } else {
          showError("Error", syncCartResult.message);
        }
      } catch (error) {
        showError("Error", "Failed to save cart. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    } else {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      const syncCartResult = await syncCart();

      if (syncCartResult.success) {
        showSuccess("Success", syncCartResult.message);
      } else {
        showError("Error", syncCartResult.message);
      }
    }
  };

  return (
    <div>
      {modelImages.length > 0 && (
        <StickyHeader
          title={phoneModelName}
          condition={selectedCondition}
          storage={selectedStorage}
          color={selectedColor}
          price={priceSelected}
          image={imageToUse || ""}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Main div */}
      <div className="w-[95%] md:w-[70%] mx-auto">
        {/* Div into two columns */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side container box */}
          <div className="w-full md:w-1/2 bg-gray-50 rounded-lg">
            <div className="md:w-full md:h-[65vh] md:sticky md:top-20">
              <div className="h-auto md:h-full flex flex-col justify-center">
                <div className="relative h-[300px] md:h-[500px] w-full mb-4">
                  {modelImages.length > 0 ? (
                    <img
                      src={modelImages[currentImageIndex].image}
                      alt={`${selectedColor} iPhone - View ${currentImageIndex + 1}`}
                      className="absolute inset-0 h-full w-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Images</div>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={prevImage}
                    disabled={modelImages.length <= 1}
                    className="bg-black p-2.5 rounded-full shadow-lg transition-all duration-200 border border-gray-800 text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 disabled:opacity-50 mx-2"
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
                    {modelImages.map((imageObj, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2
              ${currentImageIndex === index ? "border-black" : "border-transparent"}`}
                      >
                        <img src={imageObj.image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={nextImage}
                    disabled={modelImages.length <= 1}
                    className="bg-black p-2.5 rounded-full shadow-lg transition-all duration-200 border border-gray-800 text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 disabled:opacity-50 mx-2"
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
          <div className="w-full md:w-1/2 bg-gray-50 rounded-lg">
            {/* Info First Section */}
            <div className="md:w-full md:h-[60vh] flex pb-5 flex-col justify-center">
              <h1 className="text-2xl font-bold mb-4 text-black tracking-tight font-sans">
                {phoneModelName} {selectedStorage} - {selectedColor}
              </h1>

              <div className="mb-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold tracking-tight">${priceSelected}</span>
                    <span className="ml-2 text-sm text-gray-500 font-medium">Includes VAT</span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                      <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Add to cart
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-black mb-2"
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
                    <span className="text-xs font-medium">
                      12-Month
                      <br />
                      Warranty
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-black mb-2"
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
                    <span className="text-xs font-medium">
                      30-Day
                      <br />
                      Returns
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-black mb-2"
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
                    <span className="text-xs font-medium">
                      Free
                      <br />
                      Shipping
                    </span>
                  </div>
                </div>
              </div>

              {/* Refurbished Banner */}
              <div className="mb-4">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-4 border border-gray-200 relative overflow-hidden">
                  {/* Abstract background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="bg-black p-2 rounded">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                      </div>
                      <div className="tracking-tight font-sans">
                        <p className="font-medium text-sm">Factory Renewed - Premium Performance</p>
                        <p className="text-gray-600 text-xs">
                          Fully tested & certified with 1-year warranty. <span className="underline">Learn more</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="p-1.5 bg-green-100 rounded text-xs">
                    <span className="text-green-800 font-medium tracking-tight font-sans">Save up to 40%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Condition Section */}
            <div className="md:w-full md:h-[60vh] flex pb-10 flex-col justify-center tracking-tight font-sans">
              <h2 className="font-bold mb-6">Select the condition</h2>

              <div className="grid grid-cols-2 gap-4">
                {conditionOptions.length > 0 ? (
                  conditionOptions.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-4 p-2 border rounded-lg cursor-pointer 
              transition-all duration-200 ease-in-out
              ${selectedCondition === option.condition ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}
                    >
                      <input
                        type="radio"
                        name="condition"
                        className="h-4 w-4 accent-black"
                        value={option.condition}
                        checked={selectedCondition === option.condition}
                        onChange={handleConditionChange}
                      />
                      <div className="flex flex-col">
                        <span className="capitalize">{option.condition}</span>
                        {selectedCondition === option.condition && selectedColor ? (
                          <span className="text-gray-600 text-sm mt-1">
                            ${colorOptions.find((opt) => opt.colorName === selectedColor)?.price || "—"}
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
              <div className="h-6"></div>

              <div className="bg-blue-50 rounded-xl p-4 mb-4 tracking-tight font-sans">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        All devices undergo a rigorous 30-point testing process to ensure premium quality. Compare conditions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Section */}
            <div className="md:w-full md:h-[60vh] flex pb-10 flex-col justify-center">
              <h2 className="font-bold mb-6 tracking-tight font-sans">Select storage</h2>

              <div className="flex flex-col gap-4">
                {storageOptions.length > 0 ? (
                  storageOptions.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 tracking-tight font-sans
            ${selectedStorage === option.storage ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="storage"
                          className="h-4 w-4 accent-black"
                          value={option.storage}
                          checked={selectedStorage === option.storage}
                          onChange={handleStorageChange}
                        />
                        <span className="tracking-tight font-sans">{option.storage}</span>
                      </div>
                      {selectedStorage === option.storage && selectedColor ? (
                        <span className="text-gray-600 text-sm mt-1 tracking-tight font-sans">
                          ${colorOptions.find((opt) => opt.colorName === selectedColor)?.price || "—"}
                        </span>
                      ) : (
                        <span className="inline-block w-14 h-4 mt-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded"></span>
                      )}
                    </label>
                  ))
                ) : (
                  <p className="col-span-full text-gray-500 tracking-tight font-sans">No storage options available</p>
                )}
              </div>
            </div>

            {/* Color Section */}
            <div className="md:w-full md:h-[60vh] flex pb-10 flex-col justify-center">
              <h2 className="font-bold mb-6">Select the color</h2>

              <div className="grid grid-cols-2 gap-2 w-full">
                {colorOptions.length > 0 ? (
                  colorOptions.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-4 p-2 border rounded-lg cursor-pointer 
                          transition-all duration-200 ease-in-out
                          ${selectedColor === option.colorName ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}
                    >
                      <input
                        type="radio"
                        name="color"
                        className="h-4 w-4 accent-black"
                        value={option.colorName}
                        checked={selectedColor === option.colorName}
                        onChange={handleColorChange}
                      />
                      <div
                        className={`w-4 h-4 rounded-full ${
                          Object.keys(colors).includes(option.colorName) ? colors[option.colorName] : "bg-gray-200"
                        }`}
                      ></div>

                      <div className="flex flex-col">
                        <span className="text-gray-700 capitalize">{option.colorName}</span>
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
            <div className="md:w-full md:h-[60vh] flex flex-col justify-center tracking-tight font-sans">
              <div className="max-w-2xl">
                <div className="flex justify-between items-start mb-6">
                  <h1 className="font-bold">Tadaaa</h1>
                </div>

                <div className="border rounded-lg p-6 mb-4 bg-gray-50 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <h2>{phoneModelName}</h2>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 border capitalize bg-gray-50 rounded-md">{selectedCondition}</span>
                    <span className="px-3 py-1 border bg-gray-50 rounded-md">{selectedStorage}</span>
                    <span className="px-3 py-1 border bg-gray-50 rounded-md">{selectedColor}</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <h2 className="font-bold">$ {priceSelected}</h2>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                    <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Add to cart
                </button>

                <div className="mb-4 mt-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg mb-2">
                    <span className="mr-3">🚚</span>
                    <span>Free delivery by Mar 26 - Mar 27</span>
                  </div>

                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <span className="mr-3">🛡️</span>
                    <span>Free 30-day returns</span>
                  </div>

                  <div className="flex items-center p-3 bg-blue-50 rounded-lg mt-2">
                    <span className="mr-3">📅</span>
                    <span>1-year warranty</span>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  Proudly refurbished by{" "}
                  <a href="#" className="font-medium">
                    Go TechPro Global Inc
                  </a>{" "}
                  🇺🇸
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-xl font-bold mb-5 w-[95%] md:w-[70%] mx-auto mt-16">
        {phoneModelName && selectedStorage && selectedColor
          ? `${phoneModelName} ${selectedStorage} - ${selectedColor} - Customer Reviews`
          : "Customer Reviews"}
      </h1>

      {phoneId && <ReviewList modelId={idForReview} colorId={colorId} />}
    </div>
  );
}
