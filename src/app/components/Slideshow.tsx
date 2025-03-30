"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const images = [
    {
      image: "/slideshow_images/banner1.jpg",
      content: (
        <div className="iphone-banner">
          <div className="iphone-banner-container">
            <div className="iphone-banner-content">
              <h1>Premium Phones</h1>
              <div className="subtitle">Like new, for less.</div>
              <p className="tagline">
                Get premium quality Phones thoroughly tested and restored to factory condition, at a fraction of the original price.
              </p>
              <div className="features">
                <div className="feature">
                  <div className="feature-icon">✓</div>
                  <div className="feature-text">180-day warranty</div>
                </div>
                <div className="feature">
                  <div className="feature-icon">✓</div>
                  <div className="feature-text">Free shipping</div>
                </div>
                <div className="feature">
                  <div className="feature-icon">✓</div>
                  <div className="feature-text">Thoroughly tested</div>
                </div>
              </div>
              <div className="price">
                Save up to 40% <span>on premium models</span>
              </div>
            </div>
            <div className="iphone-banner-image">
              <div className="relative iphone-image">
                <Image src="/slideshow_images/iphone.png" alt="Premium iPhone" fill priority={true} />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      image: "/slideshow_images/banner2.jpg",
      content: (
        <div className="refurb-market-banner">
          <div className="refurb-market-container">
            <div className="refurb-market-content">
              <h1 className="refurb-market-h1">Sustainable Tech</h1>
              <div className="refurb-market-subtitle">The growing refurbished market</div>
              <p className="refurb-market-tagline">
                Join the sustainable tech revolution with premium refurbished devices that reduce e-waste while saving you money.
              </p>

              <div className="market-stats">
                <div className="market-stat">
                  <div className="stat-value">$65B+</div>
                  <div className="stat-label">Market Size</div>
                </div>
                <div className="market-stat">
                  <div className="stat-value">15%</div>
                  <div className="stat-label">Annual Growth</div>
                </div>
                <div className="market-stat">
                  <div className="stat-value">30-50%</div>
                  <div className="stat-label">Average Savings</div>
                </div>
                <div className="market-stat">
                  <div className="stat-value">100%</div>
                  <div className="stat-label">Quality Tested</div>
                </div>
              </div>

              <div className="eco-impact">Reduce your carbon footprint with every purchase</div>
            </div>
            <div className="refurb-market-image">
              <div className="relative devices-image">
                <Image src="/slideshow_images/refurbished.png" alt="Refurbished Electronics Devices" fill priority={true} />
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
      <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] relative">
        {images.map((slide, index) => (
          <div
            key={index}
            aria-hidden={index !== currentIndex}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {slide.content && slide.content}
          </div>
        ))}
      </div>

      {/* Controls Container - Minimalistic version */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Navigation Arrows - Minimalistic */}
        <button
          onClick={goToPrevious}
          className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white p-1 sm:p-1.5 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-white/30 pointer-events-auto opacity-60 hover:opacity-80"
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
            className="w-3 h-3 sm:w-3 sm:h-3"
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white p-1 sm:p-1.5 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-white/30 pointer-events-auto opacity-60 hover:opacity-80"
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
            className="w-3 h-3 sm:w-3 sm:h-3"
          >
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Indicators - Minimalistic */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 pointer-events-auto">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 focus:outline-none ${
                index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>

        {/* Pause/Play Button - Minimalistic */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="absolute bottom-2 right-2 sm:right-4 bg-black/20 hover:bg-black/30 text-white p-1 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-white/30 pointer-events-auto opacity-60 hover:opacity-80"
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
              className="w-2 h-2 sm:w-2.5 sm:h-2.5"
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
              className="w-2 h-2 sm:w-2.5 sm:h-2.5"
            >
              <rect x="6" y="4" width="4" height="16" fill="currentColor" />
              <rect x="14" y="4" width="4" height="16" fill="currentColor" />
            </svg>
          )}
        </button>

        {/* Removed the slide counter to keep minimal */}
      </div>
    </div>
  );
}
