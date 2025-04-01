"use client";

import Image from "next/image";

interface CardProps {
  title: string;
  image: string;
  alt: string;
}

export default function Card({ title, image, alt }: CardProps) {
  return (
    <>
      <div className="relative h-40 p-3 flex items-center justify-center">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "contain" }}
          className="p-2 hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="px-4 py-3 border-t border-gray-200">
        <h2 className="font-medium text-sm md:text-base text-gray-800 truncate">{title}</h2>
      </div>
    </>
  );
}
