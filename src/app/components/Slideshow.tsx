"use client";

import { useState, useEffect, useCallback } from "react";

export default function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<{ image: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch images from the API
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/slideshow");

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const result = await response.json();

        if (Array.isArray(result.result) && result.result.length > 0) {
          setImages(result.result);
        } else {
          setError("No images found");
        }
      } catch (error) {
        console.error("Error fetching slideshow images:", error);
        setError("Failed to load images");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Navigation functions - memoized with useCallback to avoid recreating on every render
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  // Auto-rotation effect
  useEffect(() => {
    if (images.length <= 1) return; // Don't auto-rotate if there's only 0 or 1 image

    const interval = setInterval(goToNext, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [images.length, goToNext]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-[200px] sm:h-[500px] bg-gray-200 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading slideshow...</p>
      </div>
    );
  }

  // Error state
  if (error || images.length === 0) {
    return (
      <div className="w-full h-[200px] sm:h-[500px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">{error || "No images available"}</p>
      </div>
    );
  }

  return (
    <div className="relative w-[95%] mx-auto">
      {/* Main Image */}
      <div className="w-full h-[200px] sm:h-[500px] relative overflow-hidden">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
              index === currentIndex
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={image.image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={goToPrevious}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors focus:outline-none"
        aria-label="Previous slide"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M15 18l-6-6 6-6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors focus:outline-none"
        aria-label="Next slide"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M9 18l6-6-6-6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Slide indicators (dots) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
