// app/auth/verification-success/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerificationSuccess() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/login_signup"; // Redirect to home or login page
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Email Verified!</h2>
          <p className="mt-2 text-gray-600">Your email has been successfully verified. You can now log in to your account.</p>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500">Redirecting in {countdown} seconds...</p>
          <p className="mt-4">
            <Link href="/login_signup" className="text-black font-medium hover:text-gray-700">
              Go to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
