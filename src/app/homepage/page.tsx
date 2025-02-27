// src\app\homepage\layout.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Slideshow from "../components/Slideshow";
import Card from "../components/CardsForHomepage";
import Spacer from "../components/Spacer";
import RecentlyViewed from "../components/RecentlyViewed";

export default function Home() {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const cardsData = [
    { title: "iPhone", image: "phone_images/phone.jpg" },
    { title: "Vivo", image: "phone_images/phone.jpg" },
    { title: "Xiaomi", image: "phone_images/phone.jpg" },
    { title: "Huawei", image: "phone_images/phone.jpg" },
  ];

  return (
    <div>
      <div>
        <Slideshow />
      </div>
      <Spacer />
      <Spacer />

      <div>
        <RecentlyViewed />
      </div>
      <Spacer />
      <Spacer />

      <div className="w-[95%] md:w-[70%] mx-auto">
        <h2 className="text-2xl font-bold">Shop Most Wanted</h2>
        <Spacer />

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {cardsData.length > 0 ? (
            cardsData.map((card, index) => (
              <div
                key={index}
                className="group transition-transform duration-300 hover:translate-y-[-5px]"
              >
                <Link
                  href={`/homepage/product_page/${encodeURIComponent(
                    card.title
                  )}`}
                >
                  <div
                    className="h-full bg-white rounded-2xl overflow-hidden
                 transform transition-all duration-300
                 shadow hover:shadow-lg dark:shadow-gray-800/20"
                  >
                    <Card
                      title={card.title}
                      image={card.image}
                      className="flex flex-col h-full"
                      imageContainerClassName="relative h-40 sm:h-44 md:h-48 p-3 flex items-center justify-center"
                      imageClassName="max-w-full max-h-full object-contain rounded-xl"
                      contentClassName="px-4 py-3 flex-grow border-t border-gray-100"
                      titleClassName="font-medium text-sm sm:text-base line-clamp-2 text-gray-800"
                    />
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-8 bg-gray-50 rounded-xl">
              <p className="text-gray-500">No products available right now</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
