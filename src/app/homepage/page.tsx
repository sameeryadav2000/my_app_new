"use client";

import Link from "next/link";
import Slideshow from "@/app/components/Slideshow";
import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import CardsForHomepage from "@/app/components/CardForHomepage";
import { useEffect, useState } from "react";
import RecentlyViewed from "@/app/components/RecentlyViewed";
import FAQ from "@/app/components/FAQ";

interface Phone {
  id: number;
  phone: string;
  image: string;
}

export default function HomePage() {
  const { showLoading, hideLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();
  const [phones, setPhones] = useState<Phone[]>([]);

  useEffect(() => {
    const fetchPhones = async () => {
      try {
        showLoading();

        const response = await fetch("/api/phones", {
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

        if (result.success && result.phones) {
          setPhones(result.phones);
        }
      } catch (error) {
        showError("Error", "Failed to load phones. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchPhones();
  }, [showLoading, hideLoading, showError]);

  return (
    <div className="bg-white">
      <div>
        <Slideshow />
      </div>
      <div className="h-6"></div>

      <div>{/* <RecentlyViewed /> */}</div>
      <div className="h-6"></div>

      {/* Special Offers Banner */}
      <div className="w-[95%] md:w-[70%] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 flex items-center shadow-sm">
            <div className="mr-3 text-blue-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Free Shipping</h3>
              <p className="text-xs text-gray-600">On orders over NPR 20,000</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 flex items-center shadow-sm">
            <div className="mr-3 text-green-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm">24/7 Support</h3>
              <p className="text-xs text-gray-600">Get help when you need it</p>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 flex items-center shadow-sm">
            <div className="mr-3 text-purple-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M20 7h-4.5a2.5 2.5 0 0 1 0-5h5a.5.5 0 0 1 .5.5v19a.5.5 0 0 1-.5.5h-5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M8 6h10.5a.5.5 0 0 1 .5.5V10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11.3 12.2a1 1 0 0 1-1.4 1.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8" cy="16" r="3" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm">30-Day Returns</h3>
              <p className="text-xs text-gray-600">Hassle-free return policy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-6"></div>
      <div className="h-6"></div>

      {/* About Our Process Banner */}
      <div className="w-full bg-gray-900 text-white py-10">
        <div className="w-[95%] md:w-[70%] mx-auto">
          <h2 className="text-2xl font-bold tracking-wide mb-8">How We Refurbish</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Quality Inspection</h3>
              <p className="text-gray-300 text-sm">Every device undergoes a thorough 30-point inspection process before refurbishment.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Professional Repair</h3>
              <p className="text-gray-300 text-sm">Our expert technicians replace worn parts with high-quality components.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="1 20 1 14 7 14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Data Wiping</h3>
              <p className="text-gray-300 text-sm">We completely sanitize all devices with military-grade data wiping technology.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-6"></div>
      <div className="h-6"></div>

      {/* Shop Most Wanted Section */}
      <div className="w-[95%] md:w-[70%] mx-auto">
        <h2 className="text-2xl font-bold text-black tracking-wide">Shop Most Wanted</h2>
        <div className="h-6"></div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {phones.length > 0 ? (
            phones.map((phone) => (
              <div key={phone.id} className="group transition-transform duration-300 hover:translate-y-[-5px]">
                <Link href={`/homepage/product_page/${encodeURIComponent(phone.id)}/${encodeURIComponent(phone.phone)}`}>
                  <div
                    className="h-full bg-white rounded-lg overflow-hidden
                    transform transition-all duration-300
                    border border-gray-300 hover:border-gray-400
                    shadow-sm hover:shadow-md"
                  >
                    <CardsForHomepage
                      title={phone.phone}
                      image={phone.image}
                      className="flex flex-col h-full"
                      imageContainerClassName="relative h-40 sm:h-44 md:h-48 flex items-center justify-center"
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

      <div className="h-6"></div>
      <div className="h-6"></div>

      {/* Main Banner */}
      <div className="w-full bg-gray-50 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Refurbished tech helps the planet.</h1>
          <p className="text-lg text-gray-700 mb-8">We believe in a world that does more with what we already have.</p>
        </div>
      </div>

      {/* Add FAQ Section after Main Banner */}
      <FAQ />
    </div>
  );
}
