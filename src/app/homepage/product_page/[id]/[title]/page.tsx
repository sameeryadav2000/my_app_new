// src\app\homepage\product_page\[title]\page.tsx

"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import slugify from "slugify";
import Link from "next/link";
import CardsForPhone from "@/app/components/CardsForPhone";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ReviewList from "@/app/components/ReviewList";

interface PhoneModel {
  id: number;
  model: string;
  startingPrice: number;
  phoneId: number;
  image: string;
}

const ITEMS_PER_PAGE = 4;

export default function ProductListingPage() {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || 1);

  const params = useParams();
  const id = Number(params.id);
  const title = params.title;

  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchCards = useCallback(() => {
    showLoading();

    const fetchPhoneModels = async () => {
      try {
        const response = await fetch(`/api/phone_models?page=${currentPage}&limit=${ITEMS_PER_PAGE}&id=${id}`, {
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
        }
      } catch (error) {
        showError("Error", "Failed to load phone models. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchPhoneModels();

    // Return an empty cleanup function to avoid the TypeScript error
    return () => {};
  }, [currentPage, title, id, showLoading, hideLoading, showError]);

  useEffect(() => {
    const cleanup = fetchCards();

    window.scrollTo({ top: 0, behavior: "smooth" });

    return cleanup;
  }, [fetchCards]);

  const router = useRouter();

  const handlePageChange = (pageNumber: number) => {
    router.replace(`/homepage/product_page/${id}/${title}?page=${pageNumber}`, {
      scroll: false,
    });
  };

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
    <div className="w-[95%] md:w-[70%] mx-auto py-8">
      {/* Trust banners section */}
      <div className="bg-gray-100 rounded-xl mb-8 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          <div className="flex items-center gap-3 p-4 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-sm font-medium">6-month warranty</span>
          </div>
          <div className="flex items-center gap-3 p-4 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <span className="text-sm font-medium">Free standard shipping</span>
          </div>
          <div className="flex items-center gap-3 p-4 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-sm font-medium">Free 30-day returns</span>
          </div>
          <div className="flex items-center gap-3 p-4 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-sm font-medium">Friendly customer service</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="md:text-4xl text-2xl font-bold text-black">Verified Refurbished {title}</h1>
      </div>

      <div className="text-gray-500 text-sm mb-6">{!isLoading ? <span>{totalItems} products</span> : <span>Loading models...</span>}</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
        {phoneModels.map((phoneModel) => (
          <Link
            key={phoneModel.id}
            href={`/homepage/product_detail_page/${phoneModel.id}/${slugify(phoneModel.model)}`}
            className="group block h-full transition-all duration-300"
          >
            <div className="h-full bg-white border rounded-xl overflow-hidden group-hover:shadow-lg transition-all duration-300 group-hover:translate-y-[-4px]">
              <div className="flex flex-row items-center h-full">
                <div className="order-2 sm:order-1 flex-1">
                  <CardsForPhone
                    title={`${phoneModel.model}`}
                    image={phoneModel.image}
                    startingText="Starting at"
                    price={phoneModel.startingPrice}
                    className="flex flex-col h-full"
                    imageContainerClassName="hidden sm:block w-full h-64 overflow-hidden relative"
                    imageClassName="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    contentClassName="flex-1 p-6 border-t sm:border-t border-gray-100"
                    titleClassName="text-black line-clamp-2 text-lg mb-2"
                    startingTextClassName="text-gray-500 py-1"
                    priceClassName="text-xl text-black py-1"
                  />
                </div>
                <div className="order-1 sm:hidden w-1/2 p-4">
                  <img
                    src={phoneModel.image}
                    alt={phoneModel.model}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
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
        <div className="mt-10 flex flex-col items-center">
          <div className="text-sm text-gray-500 mb-3">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-1 ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                  : "bg-white border border-gray-200 text-black hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-1 ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                  : "bg-white border border-gray-200 text-black hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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

      <div className="h-20"></div>

      {/* Simplified promotional banner section - no images, maintains layout on mobile */}
      <div className="rounded-xl overflow-hidden bg-indigo-500 mb-8">
        <div className="p-6 sm:p-8 md:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            <span className="text-white">Why do we call'em </span>
            <span className="text-yellow-300">good deals?</span>
          </h2>
          <p className="text-white/90 mb-5 max-w-2xl mx-auto text-sm sm:text-base">
            We usually don't see a price this low for this model, which means you get the best quality for the lowest price. Snag it while
            you can.
          </p>
        </div>
      </div>

      {id && <ReviewList modelId={id} />}
    </div>
  );
}
