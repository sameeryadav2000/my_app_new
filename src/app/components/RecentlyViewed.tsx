"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CardsForPhone from "./CardsForPhone";
import Spacer from "./Spacer";

const RecentlyViewed = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const products = [
    {
      title: "iPhone 1 - Unlocked",
      image: "../../../../iphone_images/phone.jpg",
      slug: "iphone-14",
    },
    {
      title: "iPhone 2 (2022) - Usdaasds",
      image: "../../../../iphone_images/phone.jpg",
      slug: "iphone-se-2022",
    },
    {
      title: "iPhone 3 - Unlocked",
      image: "../../../../iphone_images/phone.jpg",
      slug: "iphone-11",
    },
    {
      title: "iPhone 4 - Unlocked",
      image: "../../../../iphone_images/phone.jpg",
      slug: "iphone-13",
    },
    {
      title: "iPhone 5 - Unlocked",
      image: "../../../../iphone_images/phone.jpg",
      slug: "iphone-12",
    },
    {
      title: "iPhone 6 - Unlocked",
      image: "../../../../iphone_images/phone.jpg",
      slug: "iphone-xr",
    },
    {
      title: "iPhone 7 - Unlocked",
      image: "../../../../iphone_images/phone.jpg",
      slug: "iphone-x",
    },
    {
      title: "iPhone 8 - Unlocked",
      image: "../../../../iphone_images/phone.jpg",
      slug: "iphone-8",
    },
  ];

  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setCurrentIndex(0); // Reset index on every screen size change
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const cardsToShow = isMobile ? 2 : 4;
  const slideBy = 2; // Number of cards to slide
  const maxIndex = Math.ceil((products.length - cardsToShow) / slideBy);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="w-[95%] md:w-[70%] mx-auto bg-[#7D6167] pt-10 pl-10 pr-10 pb-10 rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Recently viewed</h2>
        <div className="flex gap-2">
          <button
            className={`p-2 rounded-full transition-colors ${
              currentIndex === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200 text-black"
            }`}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-6 h-6"
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
            className={`p-2 rounded-full transition-colors ${
              currentIndex >= maxIndex
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-6 h-6"
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
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-out gap-4"
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
                         transform origin-center hover:scale-[1.02] 
                         shadow-none hover:shadow-xl"
                >
                  <CardsForPhone
                    title={product.title}
                    image={product.image}
                    className="flex flex-col h-full"
                    imageContainerClassName=""
                    imageClassName="rounded-xl"
                    contentClassName="bg-[#817B69] font-bold text-white w-[95%] mx-auto m-2 h-full rounded-lg"
                    titleClassName="text-sm break-words break-all p-2"
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewed;

// <div className="overflow-hidden">
//         <div
//           className="flex transition-transform duration-300 ease-in-out gap-6"
//           style={{
//             transform: `translateX(-${currentIndex * 25}%)`,
//             width: `${products.length * (100 / cardsToShow)}%`,
//           }}
//         >
//           {products.map((product, index) => (
//             <div
//               key={index}
//               style={{ width: `${100 / products.length}%` }}
//               className="border-gray-300"
//             >
//               <Link href={`/product/${product.slug}`}>
//                 <CardsForPhone
//                   title={product.title}
//                   image={product.image}
//                   className="flex flex-col bg-white rounded overflow-hidden"
//                   imageContainerClassName="flex justify-center"
//                   imageClassName="w-full md:w-[200px] h-full object-contain"
//                   contentClassName="w-full md:w-[200px] break-words break-all"
//                   titleClassName="text-sm font-bold break-words break-all "
//                 />
//               </Link>
//             </div>
//           ))}
//         </div>
//       </div>
