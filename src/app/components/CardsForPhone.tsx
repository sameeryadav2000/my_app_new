import React from "react";
import { formatNPR } from "@/src/utils/formatters";
import Image from "next/image";

interface PhoneCardProps {
  title: string;
  image: string;
  startingText: string;
  price: number | string;
}

export default function CardsForPhone({ title, image, startingText, price }: PhoneCardProps) {
  return (
    <div className="h-full border rounded-xl overflow-hidden group-hover:shadow-lg transition-all">
      {/* For medium screens and up: vertical layout (original) */}
      <div className="hidden md:block h-full">
        <div className="relative h-32">
          {image ? (
            <Image src={image} alt={title} fill sizes="(min-width: 768px) 25vw, 100vw" style={{ objectFit: "contain" }} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-gray-400 text-xs text-center">No Image</div>
            </div>
          )}
        </div>
        <div className="p-3">
          <h2 className="font-medium">{title}</h2>
          <p className="text-sm text-gray-500">{startingText}</p>
          <div className="font-bold mt-1">{formatNPR(price)}</div>
        </div>
      </div>

      {/* For small screens: horizontal layout (image left, text right) */}
      <div className="flex md:hidden flex-row items-center h-full">
        <div className="w-1/3 p-2 relative aspect-square">
          {image ? (
            <Image src={image} alt={`${title} image`} fill sizes="(max-width: 767px) 33vw, 100vw" style={{ objectFit: "contain" }} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-gray-400 text-xs text-center">No Image</div>
            </div>
          )}
        </div>
        <div className="w-2/3 p-3">
          <h2 className="font-medium">{title}</h2>
          <p className="text-sm text-gray-500">{startingText}</p>
          <div className="font-bold mt-1">{formatNPR(price)}</div>
        </div>
      </div>
    </div>
  );
}
