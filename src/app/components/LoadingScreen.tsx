"use client";

import React from "react";

interface SpinnerProps {
  size?: number;
  color?: string;
}

export default function LoadingScreen({ size = 20, color = "#333333" }: SpinnerProps) {
  return (
    <div className="inline-block">
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .spinner {
          width: ${size}px;
          height: ${size}px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-top-color: ${color};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
      <div className="spinner"></div>
    </div>
  );
}
