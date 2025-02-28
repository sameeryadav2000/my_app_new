// src\app\homepage\product_page\[title]\page.tsx

"use client";

import { useEffect, useState } from "react";
import slugify from "slugify";
import Link from "next/link";
import CardsForPhone from "@/app/components/CardsForPhone";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 4;

export default function ProductPage() {
  const [cardsData, setCardsData] = useState<any[]>([]); // State to hold fetched card data
  const [error, setError] = useState<string>("");
  const params = useParams();
  const title = params.title as string;

  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const router = useRouter();

  const currentPage = Number(searchParams.get("page") || 1);

  // Fetch the cards from the API on component mount
  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/iphone?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );
        const result = await response.json();

        if (response.ok) {
          setCardsData(result.data || []);
          setTotalItems(result.total || 0);
          setTotalPages(Math.ceil((result.total || 0) / ITEMS_PER_PAGE));
        } else {
          setError(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
        setError("Failed to fetch cards");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handlePageChange = (pageNumber: number) => {
    router.push(`/homepage/product_page/${title}?page=${pageNumber}`);
  };

  const renderPaginationButtons = () => {
    const buttons = [];

    // Always show first page
    buttons.push(
      <button
        key="first"
        onClick={() => handlePageChange(1)}
        className={`px-3 py-1 rounded-md ${
          currentPage === 1
            ? "bg-black text-white"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        1
      </button>
    );

    if (totalPages > 7) {
      if (currentPage > 3) {
        buttons.push(
          <span key="ellipsis1" className="px-2">
            ...
          </span>
        );
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (i <= totalPages - 1 && i >= 2) {
          buttons.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`px-3 py-1 rounded-md ${
                currentPage === i
                  ? "bg-black text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i}
            </button>
          );
        }
      }

      if (currentPage < totalPages - 2) {
        buttons.push(
          <span key="ellipsis2" className="px-2">
            ...
          </span>
        );
      }
    } else {
      // Show all page numbers if there aren't many pages
      for (let i = 2; i < totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded-md ${
              currentPage === i
                ? "bg-black text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i}
          </button>
        );
      }
    }

    if (totalPages > 1) {
      buttons.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? "bg-black text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="w-[95%] md:w-[70%] mx-auto py-8">
      <h1 className="md:text-4xl text-2xl font-bold mb-8">
        Verified Refurbished {title}
      </h1>

      <div className="text-gray-500 text-sm mb-6">
        {!isLoading ? (
          <span>{totalItems} products</span>
        ) : (
          <span>Loading models...</span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
        {cardsData.map((card) => (
          <Link
            key={card.id}
            href={`/homepage/product_detail_page/${card.id}/${slugify(
              card.title
            )}`}
            className="group block h-full transition-all duration-300"
          >
            <div className="h-full bg-white rounded-xl shadow-sm overflow-hidden group-hover:shadow-md transition-all duration-300 group-hover:translate-y-[-4px]">
              {card.bestseller && (
                <div className="bg-gray-500 absolute text-[#DAD3C9] text-xs font-bold px-2 py-1 rounded-lg z-10">
                  Bestseller
                </div>
              )}
              <CardsForPhone
                title={`${card.title} - ${card.carrier}`}
                image={card.image}
                startingText="Starting at"
                price={card.price}
                className="flex flex-row sm:flex-col h-full"
                imageContainerClassName="w-1/3 sm:w-full sm:h-60 flex items-center justify-center bg-gray-50"
                imageClassName="w-full h-full object-cover rounded-xl"
                contentClassName="flex-1 p-4 sm:border-t border-gray-100"
                titleClassName="font-medium text-gray-800 line-clamp-2"
                startingTextClassName="text-xs text-gray-900 py-1"
                priceClassName="text-md text-gray-900 py-1 font-bold"
              />
            </div>
          </Link>
        ))}
      </div>

      {cardsData.length === 0 && !isLoading && !error && (
        <div className="bg-gray-50 rounded-lg p-10 text-center">
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
            <div
              key={index}
              className="h-72 bg-gray-100 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 0 && !isLoading && (
        <div className="mt-8 flex flex-col items-center">
          <div className="text-sm text-gray-500 mb-3">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {/* Previous Page Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {renderPaginationButtons()}

            {/* Next Page Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
