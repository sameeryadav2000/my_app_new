"use client";

import { useState, useEffect } from "react";
import { formatNPR } from "@/utils/formatters";
import Image from "next/image";

interface StickyHeaderProps {
  title: string;
  condition: string;
  storage: string;
  color: string;
  price: number;
  image: string;
  onAddToCart: () => void;
}

export default function StickyHeader({ title, condition, storage, color, price, image, onAddToCart }: StickyHeaderProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 200);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 bg-white shadow-md z-50 transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-50 rounded-lg p-1 flex items-center justify-center hidden md:flex">
              <Image src={image} alt={title} width={44} height={44} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm md:text-sm lg:text-sm text-gray-500 hidden md:block">{title}</span>
              <span className="text-sm md:text-lg lg:text-lg capitalize">
                {condition} · {storage} · {color}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-sm md:text-sm lg:text-sm text-gray-500 hidden md:block">Price</span>
              <span className="text-lg md:text-lg lg:text-xl">{formatNPR(price)}</span>
            </div>

            <button
              className="bg-black text-white px-5 py-2 md:px-6 lg:px-6 md:py-2.5 lg:py-2.5 rounded-lg hover:bg-gray-900 transition-all duration-200 text-sm md:text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hidden md:block"
              onClick={onAddToCart}
            >
              Add to Cart
            </button>

            <button
              className="bg-black text-white p-2.5 rounded-lg hover:bg-gray-900 transition-all duration-200 md:hidden"
              onClick={onAddToCart}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
