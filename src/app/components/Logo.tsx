"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Logo() {
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    // Initial animation when page loads
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle hover animation
  const handleMouseEnter = () => {
    if (!isAnimating) {
      setIsAnimating(true);

      // Reset animation state after animation completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 600); // Animation duration + some buffer
    }
  };

  return (
    <Link href="/" className="flex items-center" onMouseEnter={handleMouseEnter}>
      <span className="text-xl md:text-2xl font-bold tracking-wider text-black relative">
        {"MobileLoom".split("").map((letter, index) => (
          <span
            key={`ringvio-${index}`}
            className="inline-block transition-all"
            style={{
              opacity: hasAnimated ? 1 : 0,
              transform: isAnimating ? `translateY(-8px)` : "translateY(0)",
              transition: isAnimating
                ? `transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`
                : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease",
              transitionDelay: hasAnimated
                ? isAnimating
                  ? `${index * 50}ms`
                  : `${(7 - index) * 50}ms` // Reverse order for return animation
                : `${index * 50}ms`,
            }}
          >
            {letter}
          </span>
        ))}
      </span>
    </Link>
  );
}
