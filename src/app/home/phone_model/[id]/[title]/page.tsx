// src\app\home\product\[title]\page.tsx

"use client";

import { useLoading } from "@/src/context/LoadingContext";
import { useNotification } from "@/src/context/NotificationContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import slugify from "slugify";
import Link from "next/link";
import CardsForPhone from "@/src/app/components/CardsForPhone";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ReviewList from "@/src/app/components/ReviewList";
import LoadingScreen from "@/src/app/components/LoadingScreen";

interface PhoneModel {
  id: number;
  model: string;
  startingPrice: number;
  phoneId: number;
  image: string;
}

// Cache configuration
const PHONE_MODELS_CACHE_KEY = "phone_models_cache";
const CACHE_EXPIRY = 60 * 60 * 1000;
const ITEMS_PER_PAGE = 10;

export default function ProductListingPage() {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showError } = useNotification();

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || 1);

  const params = useParams();
  const id = Number(params.id);
  const title = params.title as string;

  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchCards = useCallback(() => {
    let isMounted = true;
    showLoading();

    const fetchPhoneModels = async () => {
      try {
        // Get the entire cache object
        const allCachedData = JSON.parse(localStorage.getItem(PHONE_MODELS_CACHE_KEY) || "{}");

        // Create a unique identifier for this specific page/id combination
        const cacheIdentifier = `id_${id}_page_${currentPage}_limit_${ITEMS_PER_PAGE}`;

        // Check if we have valid cached data for this specific combination
        if (allCachedData[cacheIdentifier] && new Date().getTime() - allCachedData[cacheIdentifier].timestamp < CACHE_EXPIRY) {
          console.log("Using cached data for", cacheIdentifier);
          if (isMounted) {
            setPhoneModels(allCachedData[cacheIdentifier].data);
            setTotalItems(allCachedData[cacheIdentifier].total);
            setTotalPages(allCachedData[cacheIdentifier].totalPages);
            hideLoading();
            return;
          }
        }

        // Fetch data directly without cache checking
        const response = await fetch(`/api/phone_model?page=${currentPage}&limit=${ITEMS_PER_PAGE}&id=${id}`, {
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

        if (Array.isArray(result.data) && result.success) {
          const data = result.data;
          const totalItems = result.total;
          const totalPages = result.totalPages;

          setPhoneModels(data);
          setTotalItems(totalItems);
          setTotalPages(totalPages);

          // Update just this part of the cache
          allCachedData[cacheIdentifier] = {
            data: data,
            total: totalItems,
            totalPages: totalPages,
            timestamp: new Date().getTime(),
          };

          // Save the entire updated cache
          localStorage.setItem(PHONE_MODELS_CACHE_KEY, JSON.stringify(allCachedData));
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load phone models: ", error);
        showError("Error", "Failed to load phone models. Please check your connection and try again.");
      } finally {
        if (isMounted) {
          hideLoading();
        }
      }
    };

    fetchPhoneModels();

    // Return cleanup function to handle component unmount
    return () => {
      isMounted = false;
    };
  }, [currentPage, id, showError, hideLoading, showLoading]);

  useEffect(() => {
    const cleanup = fetchCards();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return cleanup;
  }, [fetchCards]);

  const router = useRouter();

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      router.replace(`/home/phone_model/${id}/${title}?page=${pageNumber}`, {
        scroll: false,
      });
    },
    [router, id, title]
  );

  const renderPaginationButtons = useMemo(() => {
    const buttons = [];

    buttons.push(
      <button
        key="first"
        onClick={() => handlePageChange(1)}
        className={`px-3 py-1.5 rounded-md font-medium min-w-[32px] transition-all duration-200 ${
          currentPage === 1
            ? "bg-black text-white shadow-md"
            : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
        }`}
      >
        1
      </button>
    );

    if (totalPages > 6) {
      if (currentPage > 3) {
        buttons.push(
          <span key="ellipsis1" className="px-2 flex items-center text-gray-500">
            •••
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
              className={`px-3 py-1.5 rounded-md font-medium min-w-[32px] transition-all duration-200 ${
                currentPage === i
                  ? "bg-black text-white shadow-md"
                  : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {i}
            </button>
          );
        }
      }

      if (currentPage < totalPages - 2) {
        buttons.push(
          <span key="ellipsis2" className="px-2 flex items-center text-gray-500">
            •••
          </span>
        );
      }
    } else {
      for (let i = 2; i < totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1.5 rounded-md font-medium min-w-[32px] transition-all duration-200 ${
              currentPage === i
                ? "bg-black text-white shadow-md"
                : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
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
          className={`px-3 py-1.5 rounded-md font-medium min-w-[32px] transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-black text-white shadow-md"
              : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  }, [currentPage, totalPages, handlePageChange]);

  return (
    <>
      <div className="w-[95%] md:w-[70%] mx-auto py-6 md:py-7 lg:py-8">
        {/* Trust banners section */}
        <div className="bg-gray-100 rounded-xl mb-6 md:mb-7 lg:mb-8 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-5 lg:h-6 w-5 md:w-5 lg:w-6 text-black"
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
              <span className="text-xs md:text-xs lg:text-sm font-medium">6-month warranty</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-5 lg:h-6 w-5 md:w-5 lg:w-6 text-black"
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
              <span className="text-xs md:text-xs lg:text-sm font-medium">Free standard shipping</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-5 lg:h-6 w-5 md:w-5 lg:w-6 text-black"
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
              <span className="text-xs md:text-xs lg:text-sm font-medium">Free 30-day returns</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-5 lg:h-6 w-5 md:w-5 lg:w-6 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-xs md:text-xs lg:text-sm font-medium">Friendly customer service</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6 md:mb-7 lg:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-4xl font-bold text-black">Verified Refurbished {title}</h1>
        </div>

        {/* When loading is true, show the loading screen */}
        {isLoading ? (
          <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4 flex justify-center items-center py-20">
            <LoadingScreen />
          </div>
        ) : (
          <>
            {/* Only show these sections when not loading */}
            {totalItems > 0 && (
              <div className="text-xs md:text-sm text-gray-500 mb-4 md:mb-5 lg:mb-6">
                <span>{totalItems} products</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
              {phoneModels.map((phoneModel) => (
                <Link
                  key={phoneModel.id}
                  href={`/home/phone_model_detail/${phoneModel.id}/${slugify(phoneModel.model, { lower: true, strict: true })}`}
                  className="group block h-full transition-all duration-300"
                >
                  <CardsForPhone
                    title={phoneModel.model}
                    image={phoneModel.image}
                    startingText="Starting at"
                    price={phoneModel.startingPrice}
                  />
                </Link>
              ))}
            </div>

            {totalPages > 0 && (
              <div className="mt-8 md:mt-9 lg:mt-10 flex flex-col items-center">
                <div className="text-xs md:text-sm text-gray-500 mb-2 md:mb-2.5 lg:mb-3">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 md:px-3.5 lg:px-4 py-1.5 md:py-1.5 lg:py-2 rounded-md text-sm md:text-sm lg:text-base font-medium transition-all duration-200 flex items-center gap-1 ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                        : "bg-white border border-gray-200 text-black hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={currentPage === 1 ? "text-gray-400" : "text-gray-600"}
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Previous
                  </button>

                  {renderPaginationButtons}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 md:px-3.5 lg:px-4 py-1.5 md:py-1.5 lg:py-2 rounded-md text-sm md:text-sm lg:text-base font-medium transition-all duration-200 flex items-center gap-1 ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                        : "bg-white border border-gray-200 text-black hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    Next
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={currentPage === totalPages ? "text-gray-400" : "text-gray-600"}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="h-10"></div>

        {/* Simplified promotional banner section - no images, maintains layout on mobile */}
        <div className="rounded-xl overflow-hidden bg-indigo-500 mb-6 md:mb-7 lg:mb-8">
          <div className="p-5 md:p-6 lg:p-10 text-center">
            <h2 className="text-xl md:text-2xl lg:text-4xl font-bold mb-2 md:mb-2.5 lg:mb-4">
              <span className="text-white">Why do we call them </span>
              <span className="text-yellow-300">good deals?</span>
            </h2>
            <p className="text-white/90 mb-4 md:mb-4.5 lg:mb-5 max-w-2xl mx-auto text-xs md:text-sm lg:text-base">
              We usually do not see a price this low for this model, which means you get the best quality for the lowest price. Snag it
              while you can.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-10 mt-12 w-full">
        <div className="w-[95%] md:w-[70%] mx-auto">
          <div className="border-b border-gray-300 pb-3 md:pb-3.5 lg:pb-4 mb-4 md:mb-5 lg:mb-6">
            <h1 className="text-xl md:text-xl lg:text-2xl font-bold mb-0.5 md:mb-0.5 lg:mb-1">Customer Reviews</h1>
            {title && (
              <p className="text-sm md:text-lg lg:text-lg text-gray-600">
                <span className="font-medium">{title}</span>
              </p>
            )}
          </div>

          <div>{id && <ReviewList phoneModelId={id} />}</div>
        </div>
      </div>
    </>
  );
}
