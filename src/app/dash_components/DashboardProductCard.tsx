// ProductCard.tsx
import React from "react";
import Image from "next/image";
import { PhoneModelDetails } from "@/app/dashboard/products/page";

interface ProductCardProps {
  product: PhoneModelDetails;
  onEdit: (product: PhoneModelDetails) => void;
}

export default function DashboardProductCard({ product, onEdit }: ProductCardProps) {
  const hasImages = product.images && product.images.length > 0;

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 
                    w-full max-w-[280px] min-h-[380px] sm:max-w-[300px] md:max-w-[320px] flex flex-col mx-auto 
                    relative"
    >
      {" "}
      {/* Added relative for positioning context */}
      {/* Bestseller tag */}
      {product.phone.bestseller && (
        <div
          className="absolute top-2 right-2 bg-amber-400 text-white px-2.5 py-0.5 text-xs font-semibold 
                       rounded-full z-10 tracking-wide"
        >
          Bestseller
        </div>
      )}
      {/* Edit button - Adjusted positioning and z-index */}
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
      {/* Image Container */}
      <div className="relative w-full h-52 sm:h-56 md:h-60 flex-shrink-0 bg-gray-50">
        {hasImages ? (
          <Image
            src={product.images[0].image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 280px, (max-width: 768px) 300px, 320px"
            style={{ objectFit: "cover" }}
            className="transition-transform duration-300 hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2 leading-tight">{product.title}</h3>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {[product.storage, product.condition, product.color.color].map((spec, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 
                        border border-gray-200"
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
