"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const images = [
    {
      content: (
        <div className="h-full bg-blue-50 xl:bg-gradient-to-r xl:from-blue-50 xl:to-cyan-50">
          <div className="container mx-auto h-full flex flex-col xl:flex-row items-center justify-center xl:justify-start px-4">
            <div className="w-full xl:w-3/5 p-4">
              <h1 className="text-2xl xl:text-4xl font-bold mb-1 xl:mb-2">Premium Phones</h1>
              <div className="text-lg xl:text-2xl text-gray-700 mb-2 xl:mb-4">Like new, for less.</div>
              <p className="text-sm xl:text-base text-gray-600 mb-3 xl:mb-6 line-clamp-3 xl:line-clamp-none">
                Get premium quality Phones thoroughly tested and restored to factory condition, at a fraction of the original price.
              </p>
              <div className="flex flex-wrap gap-2 mb-3 xl:mb-6">
                <div className="flex items-center text-sm">
                  <div className="text-green-600 mr-1 text-xs">✓</div>
                  <div>180-day warranty</div>
                </div>
                <div className="flex items-center text-sm">
                  <div className="text-green-600 mr-1 text-xs">✓</div>
                  <div>Free shipping</div>
                </div>
                <div className="flex items-center text-sm">
                  <div className="text-green-600 mr-1 text-xs">✓</div>
                  <div>Thoroughly tested</div>
                </div>
              </div>
              <div className="font-bold text-base xl:text-xl text-green-600">
                Save up to 40% <span className="text-gray-600 text-xs xl:text-base font-normal">on premium models</span>
              </div>
            </div>
            <div className="hidden xl:block xl:w-2/5 p-2 xl:p-4">
              <div className="relative w-full h-[350px]">
                <Image
                  src="/slideshow_images/iphone.png"
                  alt="Premium iPhone"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "contain" }}
                  priority={true}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      content: (
        <div className="h-full bg-green-50 xl:bg-gradient-to-r xl:from-green-50 xl:to-emerald-50">
          <div className="container mx-auto h-full flex flex-col xl:flex-row items-center justify-center xl:justify-start px-4">
            <div className="w-full xl:w-3/5 p-4">
              <h1 className="text-2xl xl:text-4xl font-bold mb-1 xl:mb-2">Sustainable Tech</h1>
              <div className="text-lg xl:text-2xl text-gray-700 mb-2 xl:mb-4">The growing refurbished market</div>
              <p className="text-sm xl:text-base text-gray-600 mb-3 xl:mb-6 line-clamp-3 xl:line-clamp-none">
                Join the sustainable tech revolution with premium refurbished devices that reduce e-waste while saving you money.
              </p>
              <div className="grid grid-cols-2 gap-2 xl:gap-4 mb-3 xl:mb-6">
                <div className="text-center">
                  <div className="text-lg xl:text-2xl font-bold">$65B+</div>
                  <div className="text-xs xl:text-sm text-gray-600">Market Size</div>
                </div>
                <div className="text-center">
                  <div className="text-lg xl:text-2xl font-bold">15%</div>
                  <div className="text-xs xl:text-sm text-gray-600">Annual Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-lg xl:text-2xl font-bold">30-50%</div>
                  <div className="text-xs xl:text-sm text-gray-600">Average Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-lg xl:text-2xl font-bold">100%</div>
                  <div className="text-xs xl:text-sm text-gray-600">Quality Tested</div>
                </div>
              </div>
              <div className="text-xs xl:text-sm text-gray-700 italic">Reduce your carbon footprint with every purchase</div>
            </div>
            <div className="hidden xl:block xl:w-2/5 p-2 xl:p-4">
              <div className="relative w-full h-[350px]">
                <Image
                  src="/slideshow_images/refurbished.png"
                  alt="Refurbished Electronics Devices"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));

    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [images.length, isTransitioning]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));

    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [images.length, isTransitioning]);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [goToNext, images.length, isPaused]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    },
    [goToPrevious, goToNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured promotions slideshow"
    >
      <div className="w-full h-[300px] xl:h-[400px] relative">
        {images.map((slide, index) => (
          <div
            key={index}
            aria-hidden={index !== currentIndex}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {/* Controls Container */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute top-1/2 left-2 xl:left-4 transform -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white p-1 xl:p-1.5 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-white/30 pointer-events-auto opacity-60 hover:opacity-80"
          aria-label="Previous slide"
          disabled={isTransitioning}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3 h-3 xl:w-3 xl:h-3"
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute top-1/2 right-2 xl:right-4 transform -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white p-1 xl:p-1.5 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-white/30 pointer-events-auto opacity-60 hover:opacity-80"
          aria-label="Next slide"
          disabled={isTransitioning}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3 h-3 xl:w-3 xl:h-3"
          >
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Indicators */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 pointer-events-auto">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 xl:w-2 xl:h-2 rounded-full transition-all duration-300 focus:outline-none ${
                index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>

        {/* Pause/Play Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="absolute bottom-2 right-2 xl:right-4 bg-black/20 hover:bg-black/30 text-white p-1 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-white/30 pointer-events-auto opacity-60 hover:opacity-80"
          aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
        >
          {isPaused ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-2 h-2 xl:w-2.5 xl:h-2.5"
            >
              <polygon points="5 3 19 12 5 21" fill="currentColor" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-2 h-2 xl:w-2.5 xl:h-2.5"
            >
              <rect x="6" y="4" width="4" height="16" fill="currentColor" />
              <rect x="14" y="4" width="4" height="16" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
