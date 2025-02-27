// src\app\homepage\product_page\[title]\page.tsx

"use client";

import { useEffect, useState } from "react";
import slugify from "slugify";
import Link from "next/link";
import CardsForPhone from "@/app/components/CardsForPhone";

export default function ProductPage() {
  const [cardsData, setCardsData] = useState<any[]>([]); // State to hold fetched card data
  const [error, setError] = useState<string>("");

  // Fetch the cards from the API on component mount
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch("/api/iphone");
        const result = await response.json();
        console.log(result["result"]);

        if (response.ok) {
          setCardsData(result["result"]); // Set the cards data to state
        } else {
          setError(result.error || "Unknown error"); // Handle errors from API
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
        setError("Failed to fetch cards");
      }
    };

    fetchCards(); // Trigger the fetch when component mounts
  }, []);

  return (
    <div className="w-[95%] md:w-[70%] mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Featured Phones</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
        {cardsData.map((card, index) => (
          <Link
            key={card.id}
            href={`/homepage/product_detail_page/${card.id}/${slugify(
              card.title
            )}`}
            className="group block h-full transition-all duration-300"
          >
            <div className="h-full bg-white rounded-xl shadow-sm overflow-hidden group-hover:shadow-md transition-all duration-300 group-hover:translate-y-[-4px]">
              <CardsForPhone
                title={card.title}
                image={card.image}
                className="flex flex-row sm:flex-col h-full"
                imageContainerClassName="w-1/3 sm:w-full sm:h-60 flex items-center justify-center bg-gray-50"
                imageClassName="w-full h-full object-cover rounded-xl"
                contentClassName="flex-1 p-4 sm:border-t border-gray-100"
                titleClassName="font-medium text-gray-800 line-clamp-2"
              />

              {card.price && (
                <div className="px-4 pb-4 mt-auto">
                  <p className="font-bold text-lg">
                    ${parseFloat(card.price).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {cardsData.length === 0 && !error && (
        <div className="bg-gray-50 rounded-lg p-10 text-center">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
}
