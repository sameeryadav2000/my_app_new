"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);

  const handleGoogleSignIn = async () => {
    try {
      await signIn("keycloak", {
        // callbackUrl: "/homepage",
      });
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  // const validateEmail = (email: string) => {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailRegex.test(email);
  // };

  // const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newEmail = e.target.value;
  //   setEmail(newEmail);
  //   setIsEmailValid(validateEmail(newEmail) || newEmail === '');
  // };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (validateEmail(email)) {
  //     console.log('Email submitted:', email);
  //   } else {
  //     setIsEmailValid(false);
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-lg shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Who goes there?</h2>
        </div>

        <div className="mt-8 space-y-4">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="gap-6 w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-lg shadow-sm bg-white font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <FcGoogle className="w-6 h-6" />
            <span className="text-base">Continue with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="text-center mt-4">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
