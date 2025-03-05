// src\app\homepage\product_page\[title]\page.tsx

"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import slugify from "slugify";
import Link from "next/link";
import CardsForPhone from "@/app/components/CardsForPhone";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import CacheVisualizer from "@/app/components/CacheVisualizer";

interface IPhone {
  id: number;
  bestseller: boolean;
  title: string;
  price: number;
  image: string;
  carrier: string;
}

interface ApiResponse {
  success: boolean;
  data: IPhone[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
}

interface CacheItem {
  data: IPhone[];
  totalItems: number;
  totalPages: number;
  timestamp: number;
}

const CACHE_EXPIRY = 5 * 60 * 1000;

const ITEMS_PER_PAGE = 4;

export default function ProductListingPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || 1);

  const [cardsData, setCardsData] = useState<IPhone[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string>("");

  // For debugging - so we can force a cache refresh
  const [cacheVersion, setCacheVersion] = useState<number>(0);

  const params = useParams();
  const title = params.title as string;

  const router = useRouter();

  const cacheRef = useRef<Record<string, CacheItem>>({});

  // Function to clear the cache for debugging
  const clearCache = useCallback(() => {
    cacheRef.current = {};
    setCacheVersion((prev) => prev + 1);
  }, []);

  // Function to get data either from cache or API
  const fetchCards = useCallback(() => {
    setIsLoading(true);

    // Create a cache key based on current page and title
    const cacheKey = `${title}-page-${currentPage}-limit-${ITEMS_PER_PAGE}`;

    // Check if we have a valid cached response
    const cachedData = cacheRef.current[cacheKey];
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp < CACHE_EXPIRY) {
      console.log("Using cached data for:", cacheKey);

      // Use cached data if it's fresh
      setCardsData(cachedData.data);
      setTotalItems(cachedData.totalItems);
      setTotalPages(cachedData.totalPages);
      setIsLoading(false);

      return () => {};
    }

    console.log("Fetching fresh data for:", cacheKey);

    // No valid cache, fetch from API
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/iphone?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
          { signal }
        );

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (Array.isArray(result.data) && result.success) {
          const data = result.data || [];
          const total = result.total || 0;
          const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

          // Update state with the fetched data
          setCardsData(data);
          setTotalItems(total);
          setTotalPages(totalPages);

          // Store in cache
          cacheRef.current[cacheKey] = {
            data,
            totalItems: total,
            totalPages,
            timestamp: now,
          };
        } else {
          setError("No cards found");
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Fetch aborted");
          // setError("Request was cancelled");
        } else {
          console.error("Error fetching cards:", error);
          setError("Failed to fetch cards");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [currentPage, title]);

  useEffect(() => {
    const cleanup = fetchCards();

    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [fetchCards]);

  const handlePageChange = (pageNumber: number) => {
    router.replace(`/homepage/product_page/${title}?page=${pageNumber}`, {
      scroll: false,
    });
  };

  const renderPaginationButtons = useMemo(() => {
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

    if (totalPages > 6) {
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
  }, [currentPage, totalPages]);

  if (error) {
    return (
      <div className="w-[95%] md:w-[70%] mx-auto bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-[95%] md:w-[70%] mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="md:text-4xl text-2xl font-bold">
          Verified Refurbished {title}
        </h1>

        {/* Debug controls */}
        <button
          onClick={clearCache}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Clear Cache
        </button>
      </div>

      <div className="text-gray-500 text-sm mb-6">
        {!isLoading ? (
          <span>{totalItems} products</span>
        ) : (
          <span>Loading models...</span>
        )}
      </div>

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

            {renderPaginationButtons}

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

      {/* Cache Visualizer */}
      <CacheVisualizer cache={cacheRef.current} cacheExpiry={CACHE_EXPIRY} />
    </div>
  );
}
