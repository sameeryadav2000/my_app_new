"use client";

import React from "react";

interface LoadingScreenProps {
  isLoading?: boolean;
}

export default function LoadingScreen({ isLoading = true }: LoadingScreenProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.3;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.3;
          }
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .spinner-container {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .spinner-outer {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 3px solid transparent;
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: rotate 1.5s linear infinite;
        }

        .spinner-middle {
          position: absolute;
          width: 45px;
          height: 45px;
          top: 7.5px;
          left: 7.5px;
          border: 3px solid transparent;
          border-top-color: #f0f0f0;
          border-radius: 50%;
          animation: rotate 1.2s linear infinite reverse;
        }

        .spinner-inner {
          position: absolute;
          width: 30px;
          height: 30px;
          top: 15px;
          left: 15px;
          border: 3px solid transparent;
          border-top-color: #999999;
          border-radius: 50%;
          animation: rotate 1s linear infinite;
        }

        .spinner-center {
          position: absolute;
          width: 12px;
          height: 12px;
          top: 24px;
          left: 24px;
          background-color: #ffffff;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="bg-black p-8 rounded-md shadow-lg flex flex-col items-center">
        <div className="spinner-container">
          <div className="spinner-outer"></div>
          <div className="spinner-middle"></div>
          <div className="spinner-inner"></div>
          <div className="spinner-center"></div>
        </div>
        <p className="mt-4 text-white font-medium">Loading...</p>
      </div>
    </div>
  );
}
