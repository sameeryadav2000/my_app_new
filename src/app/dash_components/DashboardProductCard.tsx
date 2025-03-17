import React, { useState } from "react";
import Image from "next/image";
import { PhoneModelDetails } from "@/app/dashboard/products/page";

interface ProductCardProps {
  product: PhoneModelDetails;
  onEdit: (product: PhoneModelDetails) => void;
}

export default function DashboardProductCard({ product, onEdit }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const goToPreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 
        w-full max-w-[280px] min-h-[380px] sm:max-w-[300px] md:max-w-[320px] flex flex-col mx-auto 
        relative ${!product.available ? "opacity-90 grayscale" : ""}`}
    >
      {product.phone.bestseller && (
        <div
          className="absolute top-2 right-2 bg-amber-400 text-white px-2.5 py-0.5 text-xs font-semibold 
                       rounded-full z-10 tracking-wide"
        >
          Bestseller
        </div>
      )}

      {product.available && (
        <button
          onClick={() => onEdit(product)}
          className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 
              transition-all duration-200 z-30 border border-gray-200"
          aria-label="Edit product"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-700 hover:text-gray-900"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      )}

      <div className="relative w-full h-52 sm:h-56 md:h-60 flex-shrink-0 bg-gray-50 group">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[currentImageIndex].image}
            alt={`${product.title} - Image ${currentImageIndex + 1}`}
            fill
            sizes="(max-width: 640px) 280px, (max-width: 768px) 300px, 320px"
            style={{ objectFit: "contain" }}
            className="transition-transform duration-300 hover:scale-[1.03]"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <div className="flex flex-col items-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p>No image available</p>
            </div>
          </div>
        )}

        {product.images.length > 1 && (
          <>
            <button
              onClick={goToPreviousImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md z-20"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={goToNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md z-20"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full z-20">
              {currentImageIndex + 1} / {product.images.length}
            </div>
          </>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2 leading-tight">{product.title}</h3>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {[product.storage, product.condition, product.color.color].map((spec, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 
                        border border-gray-200 capitalize"
            >
              {spec}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="font-bold text-gray-900 text-lg sm:text-xl tracking-tight">${product.price.toFixed(2)}</div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-200
                ${product.available ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
            >
              {product.available ? "In Stock" : "Sold Out"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
