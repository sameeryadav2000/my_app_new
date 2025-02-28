// src\app\homepage\product_detail_page\[id]\[title]\page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { CartItem, Cart } from "@/types/cart";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import slugify from "slugify";
import Card from "../../../../components/CardsForPhone";
import AddToCartButton from "@/app/components/AddToCart";
import StickyHeader from "@/app/components/StickyHeader";
import ReviewList from "@/app/components/ReviewList";

export default function ProductPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { cart, setCart } = useCart(); // Access cart and setCart

  const [selectedCondition, setSelectedCondition] = useState<string>("");
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  const [prevSelectedCondition, setPrevSelectedCondition] =
    useState<string>("");
  const [prevSelectedStorage, setPrevSelectedStorage] = useState<string>("");
  const [prevSelectedColor, setPrevSelectedColor] = useState<string>("");

  const phoneModelName = (params.title as string).replace(/-/g, " ");

  const [conditionOptions, setConditionOptions] = useState<any[]>([]);
  const [storageOptions, setStorageOptions] = useState<any[]>([]);
  const [colorOptions, setColorOptions] = useState<any[]>([]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColorOther, setSelectedColorother] = useState<string>("Blue");

  const [error, setError] = useState<string>("");

  const images = [
    { url: "../../../iphone_images/image.png" },
    { url: "../../../iphone_images/image.png" },
    { url: "../../../iphone_images/image.png" },
    { url: "../../../iphone_images/image.png" },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const priceSelected = Number(
    colorOptions.find((option) => option.color === selectedColor)?.price || 0
  );
  const selectedCombinationId = colorOptions
    .find((option) => option.color === selectedColor)
    ?.id?.toString();

  useEffect(() => {
    const fetchIphoneModels = async () => {
      try {
        const response = await fetch(
          `/api/iphone_models?id=${params.id}&condition=${selectedCondition}&storage=${selectedStorage}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        if (!selectedCondition) {
          setConditionOptions(result.result);
        } else if (!selectedStorage && selectedCondition) {
          setStorageOptions(result.result);
        } else if (!selectedColor && selectedCondition) {
          setColorOptions(result.result);
        }
      } catch (error) {
        console.error("Error fetching iPhone models:", error);
        setError("Failed to fetch product data");
      }
    };
    fetchIphoneModels();
  }, [params.id, selectedCondition, selectedStorage, selectedColor]);

  useEffect(() => {
    if (conditionOptions.length > 0 && selectedCondition === "") {
      if (
        conditionOptions.some(
          (option) => option.condition === prevSelectedCondition
        )
      ) {
        setSelectedCondition(prevSelectedCondition);
      } else {
        setSelectedCondition(conditionOptions[0].condition);
      }
    } else if (storageOptions.length > 0 && selectedStorage === "") {
      if (
        storageOptions.some((option) => option.storage === prevSelectedStorage)
      ) {
        setSelectedStorage(prevSelectedStorage);
      } else {
        setSelectedStorage(storageOptions[0].storage);
      }
    } else if (colorOptions.length > 0 && selectedColor === "") {
      if (colorOptions.some((option) => option.color === prevSelectedColor)) {
        setSelectedColor(prevSelectedColor);
      } else {
        setSelectedColor(colorOptions[0].color);
      }
    }
  }, [conditionOptions, storageOptions, colorOptions]);

  const handleConditionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStorageOptions([]);
    setColorOptions([]);

    setPrevSelectedStorage(selectedStorage);
    setPrevSelectedColor(selectedColor);

    setSelectedStorage("");
    setSelectedColor("");

    setSelectedCondition(event.target.value); // Update the selected condition when a radio button is clicked
  };

  const handleStorageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConditionOptions([]);
    setColorOptions([]);

    setPrevSelectedCondition(selectedCondition);
    setPrevSelectedColor(selectedColor);

    setSelectedCondition("");
    setSelectedColor("");

    setSelectedStorage(event.target.value);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(event.target.value); // Update the selected condition when a radio button is clicked
  };

  const handleAddToCart = async () => {
    if (!session) {
      // Save the current product details to sessionStorage so we can recover after login
      sessionStorage.setItem(
        "pendingCartItem",
        JSON.stringify({
          id: selectedCombinationId,
          title: phoneModelName,
          condition: selectedCondition,
          storage: selectedStorage,
          color: selectedColor,
          price: priceSelected || 0,
          image: images[0].url,
        })
      );

      // Redirect to login
      router.push("/login_signup");
      return;
    }

    // Create a new cart item from the selected options
    const newItem: CartItem = {
      id: selectedCombinationId,
      title: phoneModelName,
      condition: selectedCondition,
      storage: selectedStorage,
      color: selectedColor,
      price: priceSelected || 0,
      quantity: 1,
      image: images[0].url,
    };

    // Get existing cart from localStorage
    const existingCartJson = localStorage.getItem("cart");
    const existingCart: Cart = existingCartJson
      ? JSON.parse(existingCartJson)
      : { items: [], totalItems: 0, totalPrice: 0 };

    // Check if this exact item configuration already exists
    const existingItemIndex = existingCart.items.findIndex(
      (item) =>
        item.id === newItem.id &&
        item.condition === newItem.condition &&
        item.storage === newItem.storage &&
        item.color === newItem.color
    );

    let updatedCart: Cart;

    if (existingItemIndex > -1) {
      // If item exists, increment its quantity
      const updatedItems = existingCart.items.map((item, index) =>
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
        items: [...existingCart.items, newItem],
        totalItems: existingCart.totalItems + 1,
        subTotalPrice: existingCart.subTotalPrice + newItem.price,
      };
    }
    // console.log(updatedCart.subTotalPrice);
    // Save updated cart to localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItem: newItem }),
      });

      if (!response.ok) {
        console.error("Failed to save cart item to database");
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error saving cart item:", error);
      // Handle error appropriately
    }
  };

  const colors: Record<string, string> = {
    Black: "bg-black",
    Red: "bg-red-400",
    Blue: "bg-blue-400",
    Green: "bg-green-400",
    Pink: "bg-pink-300",
  };

  return (
    <div>
      <StickyHeader
        title={phoneModelName}
        condition={selectedCondition}
        storage={selectedStorage}
        color={selectedColor}
        price={priceSelected}
        originalPrice={629.0}
        savings={348.9}
        imageSrc="../../../sticky_header_images/image.png"
      />
      {/* Main div */}
      <div className="md:w-4/5 w-[90%] mx-auto py-8">
        {/* Div into two columns */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side container box */}
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg">
            {/* Left Side - Image Carousel */}
            <div className="md:w-full md:h-screen md:sticky md:top-10">
              <div className="h-auto md:h-full flex flex-col justify-center">
                {/* Main Image Container */}
                <div className="relative h-[300px] md:h-[500px] w-full mb-4 bg-white">
                  <img
                    src={images[currentImageIndex].url}
                    alt="Product"
                    className="absolute inset-0 h-full w-full object-contain rounded-lg"
                  />
                  {/* Navigation Buttons */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg"
                  >
                    →
                  </button>
                </div>

                {/* Thumbnail Navigation */}
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2
            ${
              currentImageIndex === index
                ? "border-blue-500"
                : "border-transparent"
            }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side container box */}
          <div className="w-full md:w-1/2 bg-white rounded-lg">
            {/* Right Side Detail Section */}
            <div className="md:w-full md:h-screen flex pb-5 flex-col justify-center">
              <h1 className="text-2xl font-bold mb-4">
                {phoneModelName} {selectedStorage} - {selectedColor} - Unlocked
              </h1>

              {/* <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[...Array(4)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                  <span className="text-yellow-400 opacity-50">★</span>
                </div>
                <span className="text-sm">4.3/5</span>
                <span className="text-sm text-blue-600 underline">(1,814 reviews)</span>
              </div> */}

              <div className="mb-6">
                <div className="flex items-baseline justify-between w-full">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">${priceSelected}</span>
                  </div>
                  <AddToCartButton
                    href="/homepage/cart_page"
                    className="!w-40"
                    onClick={handleAddToCart}
                  />
                  {/* <button className="w-[40%] bg-black text-white py-4 rounded-lg hover:bg-gray-800">
                    Add to cart
                  </button> */}
                </div>
                <div className="text-sm">
                  <span className="line-through text-gray-500">
                    $629.00 new
                  </span>
                  <span className="ml-2 text-green-600">Save $339.75</span>
                </div>
              </div>
            </div>

            {/* Right Side Condition Section */}
            <div className="md:w-full md:h-screen flex pb-10 flex-col justify-center">
              <h2 className="font-bold mb-6">Select the condition</h2>

              <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg mb-6 cursor-pointer">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="flex-shrink-0"
                >
                  <path
                    d="M19 12H5M5 12L12 19M5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-gray-700 pr-8">
                  Refurbishers have restored devices to high quality based on a
                  25-point inspection. Compare conditions
                </p>
                <span className="ml-auto">›</span>
              </div>

              {/* Condition Options Grid - Always 2 columns */}
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
                        className="h-4 w-4 mr-4"
                        value={option.condition}
                        checked={selectedCondition === option.condition}
                        onChange={handleConditionChange}
                      />
                      <div className="flex flex-col">
                        <span className="capitalize">{option.condition}</span>
                        {selectedCondition === option.condition &&
                        selectedColor ? (
                          <span className="text-gray-600 text-sm">
                            $
                            {
                              colorOptions.find(
                                (option) => option.color === selectedColor
                              )?.price
                            }
                          </span>
                        ) : (
                          <span className="inline-block w-14 h-4 mt-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded"></span>
                        )}
                      </div>
                    </label>
                  ))
                ) : (
                  <p>No condition options available</p>
                )}
              </div>
            </div>

            <div className="md:w-full md:h-screen flex pb-10 flex-col justify-center">
              <h2 className="text-2xl text-gray-600 mb-6">Select storage</h2>

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
                        <span className="text-gray-700">{option.storage}</span>
                      </div>
                      {selectedStorage === option.storage && selectedColor ? (
                        <span>
                          {" "}
                          - $
                          {
                            colorOptions.find(
                              (option) => option.color === selectedColor
                            )?.price
                          }
                        </span> // Display the price of the selected color beside the condition
                      ) : (
                        <span className="inline-block w-14 h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded"></span>
                      )}
                    </label>
                  ))
                ) : (
                  <p>No storage options available</p>
                )}
              </div>
            </div>

            <div className="md:w-full md:h-screen flex pb-10 flex-col justify-center">
              <h2 className="text-gray-600 mb-6">Select the color</h2>

              <div className="grid grid-cols-2 gap-2 w-full">
                {colorOptions.length > 0 ? (
                  colorOptions.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-4 p-2 border rounded-lg cursor-pointer 
                                transition-all duration-200 ease-in-out
                                ${
                                  selectedColor === option.color
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-500"
                                }`}
                    >
                      <div className="flex items-center md:gap-4 gap-2">
                        <input
                          type="radio"
                          name="color"
                          value={option.color}
                          checked={selectedColor === option.color}
                          onChange={handleColorChange}
                          className="h-4 w-4"
                        />
                        <div
                          className={`w-4 h-4 rounded-full ${
                            colors[option.color as keyof typeof colors] || ""
                          }`}
                        ></div>
                      </div>
                      <div>
                        <div>
                          <span className="text-gray-700">{option.color}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{option.price}</span>
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <p>No color options available</p>
                )}
              </div>
            </div>

            <div className="md:w-full md:h-screen flex flex-col justify-center">
              <div className="max-w-2xl">
                <div className="flex justify-between items-start mb-6">
                  <h1 className="font-bold">Tadaaa</h1>
                </div>

                {/* Product Card */}
                <div className="border rounded-lg p-6 mb-4 bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <h2>{phoneModelName} - Unlocked</h2>
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  </div>

                  {/* Selected Options */}
                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 border capitalize">
                      {selectedCondition}
                    </span>
                    <span className="px-3 py-1 border">{selectedStorage}</span>
                    <span className="px-3 py-1 border">{selectedColor}</span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <h2 className="font-bold">$ {priceSelected}</h2>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <AddToCartButton
                  href="/homepage/cart_page"
                  className="w-full"
                  onClick={handleAddToCart}
                />

                {/* Refurbished By */}
                <div className="flex items-center gap-2 mb-6 text-gray-600">
                  <span>Proudly refurbished by</span>
                  <a
                    href="#"
                    className="font-medium text-black hover:underline"
                  >
                    Trademore
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedCombinationId && (
        <div className="md:w-4/5 w-[90%] mx-auto py-8 mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <ReviewList modelId={Number(selectedCombinationId)} />
          </div>
        </div>
      )}
    </div>
  );
}
