"use client";

import React from "react";

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50" style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
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
            width: 48px;
            height: 48px;
            border: 3px solid rgba(0, 0, 0, 0.1);
            border-top-color: #000000;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
        `}</style>
        <div className="spinner"></div>
      </div>
      <p className="mt-4 text-lg font-medium" style={{ color: "#333333" }}>
        Loading...
      </p>
    </div>
  );
}
