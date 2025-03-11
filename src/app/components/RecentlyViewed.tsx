"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CardsForPhone from "./CardsForPhone";
import Spacer from "./Spacer";

export default function RecentlyViewed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  const products = [
    {
      title: "iPhone 1 - Unlocked",
      image: "../../../../phone_images/phone.jpg",
      slug: "iphone-14",
    },
    {
      title: "iPhone 2 (2022) - Usdaasds",
      image: "../../../../phone_images/phone.jpg",
      slug: "iphone-se-2022",
    },
    {
      title: "iPhone 3 - Unlocked",
      image: "../../../../phone_images/phone.jpg",
      slug: "iphone-11",
    },
    {
      title: "iPhone 4 - Unlocked",
      image: "../../../../phone_images/phone.jpg",
      slug: "iphone-13",
    },
    {
      title: "iPhone 5 - Unlocked",
      image: "../../../../phone_images/phone.jpg",
      slug: "iphone-12",
    },
    {
      title: "iPhone 6 - Unlocked",
      image: "../../../../phone_images/phone.jpg",
      slug: "iphone-xr",
    },
    {
      title: "iPhone 7 - Unlocked",
      image: "../../../../phone_images/phone.jpg",
      slug: "iphone-x",
    },
    {
      title: "iPhone 8 - Unlocked",
      image: "../../../../phone_images/phone.jpg",
      slug: "iphone-8",
    },
  ];

  useEffect(() => {
    const checkScreenSize = () => {
      setLoading(true);

      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setCurrentIndex(0);

      setLoading(false);
    };

    checkScreenSize();

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkScreenSize, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const cardsToShow = isMobile ? 2 : 4;
  const slideBy = 2;
  const maxIndex = Math.ceil((products.length - cardsToShow) / slideBy);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="w-[95%] md:w-[70%] mx-auto bg-[#7D6167] pt-5 pl-5 pr-5 pb-5 rounded-xl">
        <p className="text-white">Loading slideshow...</p>
      </div>
    );
  }

  return (
    <div className="w-[95%] md:w-[70%] mx-auto bg-gradient-to-r from-[#8D717A] to-[#6D5157] pt-6 px-6 pb-6 rounded-2xl shadow-lg">
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-bold text-white tracking-wide">Recently viewed</h2>
    <div className="flex gap-3">
      <button
        className={`p-2 rounded-full transition-all duration-300 ${
          currentIndex === 0
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-100 text-[#7D6167] shadow-sm hover:shadow"
        }`}
        onClick={handlePrevious}
        disabled={currentIndex === 0}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            d="M15 18l-6-6 6-6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        className={`p-2 rounded-full transition-all duration-300 ${
          currentIndex >= maxIndex
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800 shadow-sm hover:shadow"
        }`}
        onClick={handleNext}
        disabled={currentIndex >= maxIndex}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            d="M9 18l6-6-6-6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>

  <Spacer />

  {/* Carousel Content */}
  <div className="overflow-hidden rounded-xl">
    <div
      className="flex transition-transform duration-500 ease-out gap-5"
      style={{
        transform: `translateX(-${currentIndex * 25}%)`,
        width: `${products.length * (100 / cardsToShow)}%`,
      }}
    >
      {products.map((product, index) => (
        <div
          key={index}
          className=""
          style={{ width: `${100 / products.length}%` }}
        >
          <Link href={`/product/${product.slug}`}>
            <div
              className="h-full transition-all duration-300 bg-white rounded-xl 
                     transform origin-center hover:scale-[1.03] 
                     shadow-md hover:shadow-xl"
            >
              <CardsForPhone
                title={product.title}
                image={product.image}
                startingText="Starting at"
                price=""
                className="flex flex-col h-full"
                imageContainerClassName=""
                imageClassName="rounded-t-xl"
                contentClassName="bg-gradient-to-r from-[#86846E] to-[#7C7364] font-bold text-white w-[95%] mx-auto m-2 h-full rounded-lg"
                titleClassName="text-sm break-words break-all p-3"
                startingTextClassName="text-xs text-gray-100 px-3 pb-3"
                priceClassName=""
              />
            </div>
          </Link>
        </div>
      ))}
    </div>
  </div>
</div>
  );
}
