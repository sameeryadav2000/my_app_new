// src\app\homepage\product_page\[title]\page.tsx

"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import slugify from "slugify";
import Link from "next/link";
import CardsForPhone from "@/app/components/CardsForPhone";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import CacheVisualizer from "@/app/components/CacheVisualizer";

interface PhoneModel {
  id: number;
  model: string;
  startingPrice: number;
  bestseller: boolean;
  image: string;
}

interface CacheItem {
  data: PhoneModel[];
  totalItems: number;
  totalPages: number;
  timestamp: number;
}

const CACHE_EXPIRY = 5 * 60 * 1000;

const ITEMS_PER_PAGE = 4;

export default function ProductListingPage() {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || 1);

  const params = useParams();
  const title = params.title;

  const cacheRef = useRef<Record<string, CacheItem>>({});

  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchCards = useCallback(() => {
    showLoading();

    const cacheKey = `${title}-page-${currentPage}-limit-${ITEMS_PER_PAGE}`;

    const cachedData = cacheRef.current[cacheKey];
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp < CACHE_EXPIRY) {
      setPhoneModels(cachedData.data);
      setTotalItems(cachedData.totalItems);
      setTotalPages(cachedData.totalPages);
      hideLoading();

      return () => {};
    }

    const fetchPhoneModels = async () => {
      try {
        const response = await fetch(`/api/phone_models?page=${currentPage}&limit=${ITEMS_PER_PAGE}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!result.success) {
          showError("Error", result.message);
          return;
        }

        if (Array.isArray(result.data) && result.success) {
          const data = result.data;
          const totalItems = result.total;
          const totalPages = result.totalPages;

          setPhoneModels(data);
          setTotalItems(totalItems);
          setTotalPages(totalPages);

          cacheRef.current[cacheKey] = {
            data,
            totalItems,
            totalPages,
            timestamp: now,
          };
        }
      } catch (error) {
        showError("Error", "Failed to load phone models. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchPhoneModels();
  }, [currentPage, title]);

  useEffect(() => {
    const cleanup = fetchCards();

    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [fetchCards]);

  const [cacheVersion, setCacheVersion] = useState<number>(0);

  const clearCache = useCallback(() => {
    cacheRef.current = {};
    setCacheVersion((prev) => prev + 1);
  }, []);

  const router = useRouter();

  const handlePageChange = (pageNumber: number) => {
    router.replace(`/homepage/product_page/${title}?page=${pageNumber}`, {
      scroll: false,
    });
  };

  const renderPaginationButtons = useMemo(() => {
    const buttons = [];

    buttons.push(
      <button
        key="first"
        onClick={() => handlePageChange(1)}
        className={`px-3 py-1 rounded-md ${currentPage === 1 ? "bg-black text-white" : "bg-gray-200 hover:bg-gray-300"}`}
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
              className={`px-3 py-1 rounded-md ${currentPage === i ? "bg-black text-white" : "bg-gray-200 hover:bg-gray-300"}`}
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
      for (let i = 2; i < totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded-md ${currentPage === i ? "bg-black text-white" : "bg-gray-200 hover:bg-gray-300"}`}
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
          className={`px-3 py-1 rounded-md ${currentPage === totalPages ? "bg-black text-white" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  }, [currentPage, totalPages]);

  return (
    <div className="w-[95%] md:w-[70%] mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="md:text-4xl text-2xl font-bold">Verified Refurbished {title}</h1>

        <button onClick={clearCache} className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded">
          Clear Cache
        </button>
      </div>

      <div className="text-gray-500 text-sm mb-6">{!isLoading ? <span>{totalItems} products</span> : <span>Loading models...</span>}</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
        {phoneModels.map((phoneModel) => (
          <Link
            key={phoneModel.id}
            href={`/homepage/product_detail_page/${phoneModel.id}/${slugify(phoneModel.model)}`}
            className="group block h-full transition-all duration-300"
          >
            <div className="h-full bg-white rounded-xl shadow-sm overflow-hidden group-hover:shadow-md transition-all duration-300 group-hover:translate-y-[-4px]">
              {Boolean(phoneModel.bestseller) && (
                <div className="bg-gray-500 absolute text-[#DAD3C9] text-xs font-bold px-2 py-1 rounded-lg z-10">Bestseller</div>
              )}
              <CardsForPhone
                title={`${phoneModel.model}`}
                image={phoneModel.image}
                startingText="Starting at"
                price={phoneModel.startingPrice}
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

      {phoneModels.length === 0 && !isLoading && (
        <div className="bg-gray-50 rounded-lg p-10 text-center">
          <p className="text-gray-500">No products found</p>
        </div>
      )}

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
                currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {renderPaginationButtons}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <CacheVisualizer cache={cacheRef.current} cacheExpiry={CACHE_EXPIRY} />
    </div>
  );
}
