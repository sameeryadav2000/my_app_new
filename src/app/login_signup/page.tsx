"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/homepage";

  const handleGoogleSignIn = async () => {
    try {
      await signIn("keycloak", {
        callbackUrl: callbackUrl,
      });
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-xl shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Who goes there?</h2>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="gap-6 w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-lg shadow-sm bg-white font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <FcGoogle className="w-6 h-6" />
            <span className="text-base">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
