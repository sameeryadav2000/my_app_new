"use client";

import Link from "next/link";
import Slideshow from "@/app/components/Slideshow";
import CardsForHomepage from "@/app/components/CardForHomepage";
import Spacer from "@/app/components/Spacer";
import RecentlyViewed from "@/app/components/RecentlyViewed";

const cardsData = [
  { title: "iPhone", image: "phone_images/yellow/1.jpg" },
  { title: "Vivo", image: "phone_images/yellow/1.jpg" },
  { title: "Xiaomi", image: "phone_images/yellow/1.jpg" },
  { title: "Huawei", image: "phone_images/yellow/1.jpg" },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      <div>
        <Slideshow />
      </div>
      <Spacer />

      <div>{/* <RecentlyViewed /> */}</div>
      <Spacer />

      <div className="w-[95%] md:w-[70%] mx-auto">
        <h2 className="text-2xl font-bold text-black tracking-wide">Shop Most Wanted</h2>
        <Spacer />

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {cardsData.length > 0 ? (
            cardsData.map((card, index) => (
              <div key={index} className="group transition-transform duration-300 hover:translate-y-[-5px]">
                <Link href={`/homepage/product_page/${encodeURIComponent(card.title)}`}>
                  <div
                    className="h-full bg-white rounded-lg overflow-hidden
                    transform transition-all duration-300
                    border border-gray-300 hover:border-gray-400
                    shadow-sm hover:shadow-md"
                  >
                    <CardsForHomepage
                      title={card.title}
                      image={card.image}
                      className="flex flex-col h-full"
                      imageContainerClassName="relative h-40 sm:h-44 md:h-48 p-3 flex items-center justify-center"
                      imageClassName="max-w-full max-h-full object-contain"
                      contentClassName="px-4 py-3 flex-grow border-t border-gray-200"
                      titleClassName="font-medium text-sm sm:text-base text-black"
                    />
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-8 bg-gray-100 rounded-lg border border-gray-300">
              <p className="text-gray-700">No products available right now</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
