"use client";

import React from "react";

interface LoadingScreenProps {
  isLoading?: boolean;
}

export default function LoadingScreen({ isLoading = true }: LoadingScreenProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/80 flex justify-center items-center z-50">
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
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}</style>
      <div className="spinner"></div>
    </div>
  );
}
