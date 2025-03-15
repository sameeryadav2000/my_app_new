"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";
import RegistrationDialog from "@/app/components/RegistrationDialog";
import SessionExpiredAlert from "@/app/components/SessionExpiredAlert";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/homepage";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await signIn("keycloak-google", {
        callbackUrl: callbackUrl,
      });
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const handleDirectLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      if (!email || !password) {
        setError("Please enter both email and password");
        setIsLoading(false);
        return;
      }

      const result = await signIn("keycloak-direct", {
        redirect: false,
        username: email,
        password: password,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        console.log("Login failed with error:", result.error);

        if (result.error.includes("Account is not fully set up")) {
          setError("Please verify your email before logging in. Check your inbox for a verification email.");
        } else {
          setError("Invalid email or password");
        }

        setIsLoading(false);
      } else {
        console.log("Login successful, redirecting to:", callbackUrl);
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error("Detailed login error:", error);
      if (error instanceof Error) {
        setError("An error occurred during login: " + error.message);
      } else {
        setError("An unexpected error occurred during login");
      }
      setIsLoading(false);
    }
  };

  const handleCreateAccount = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setIsRegistrationOpen(true);
  };

  const handleRegistrationSuccess = (email: string) => {
    setEmail(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleDirectLogin}>
          <SessionExpiredAlert />

          {error && <div className="p-3 bg-red-50 text-red-500 rounded-lg text-sm">{error}</div>}

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={handleCreateAccount}
              className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
              Create Account
            </button>
          </p>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="mt-6 w-full flex items-center justify-center px-6 py-3 border border-gray-200 rounded-lg shadow-sm bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>

      <RegistrationDialog isOpen={isRegistrationOpen} onClose={() => setIsRegistrationOpen(false)} onSuccess={handleRegistrationSuccess} />
    </div>
  );
}
