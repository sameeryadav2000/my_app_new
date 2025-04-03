"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLoading } from "@/src/context/LoadingContext";

// Component that uses useSearchParams
function VerificationErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const { hideLoading } = useLoading();

  // Hide the global loading indicator once the component is rendered
  // This is useful if you were showing loading during navigation
  hideLoading();

  // Get error message based on error code
  const getErrorMessage = () => {
    switch (error) {
      case "missing-token":
        return "Verification link is invalid. No token was provided.";
      case "invalid-token":
        return "Verification link is invalid or has already been used.";
      case "expired-token":
        return "Verification link has expired. Please request a new verification email.";
      case "user-not-found":
        return "User associated with this verification link could not be found.";
      default:
        return "An error occurred during email verification.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Verification Failed</h2>
          <p className="mt-2 text-gray-600">{getErrorMessage()}</p>
        </div>

        <div className="text-center mt-6">
          <p className="mt-4">
            <Link href="/" className="text-black font-medium hover:text-gray-700">
              Return to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Fallback component that shows while params are loading
function VerificationLoadingFallback() {
  const { showLoading } = useLoading();

  // Show global loading when component is in loading state
  showLoading();

  // Return a minimal fallback since the global loading context will handle the UI
  return null;
}

// Main component with Suspense boundary
export default function VerificationError() {
  return (
    <Suspense fallback={<VerificationLoadingFallback />}>
      <VerificationErrorContent />
    </Suspense>
  );
}
