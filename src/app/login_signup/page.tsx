"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { useLoading } from "@/context/LoadingContext";
import RegistrationDialog from "@/app/components/RegistrationDialog";
import ForgotPasswordDialog from "@/app/components/ForgotPasswordDialog";

// Types
interface LoginData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface TouchedFields {
  email: boolean;
  password: boolean;
}

// Fallback component that shows while params are loading
function LoginLoadingFallback() {
  const { showLoading } = useLoading();

  // Show global loading when component is in loading state
  showLoading();

  // Return a minimal fallback since the global loading context will handle the UI
  return null;
}

// Main login content that uses useSearchParams
function LoginPageContent() {
  // Get callback URL from search parameters
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/homepage";

  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    password: false,
  });

  // Registration dialog state
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);

  // Use the notification and loading contexts
  const { showError } = useNotification();
  const { showLoading, hideLoading, isLoading } = useLoading();

  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Hide loading once the component is rendered
  // This ensures any loading shown during navigation is hidden
  hideLoading();

  // Validate form on data change
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Mark field as touched when user changes its value
    if (!touched[name as keyof TouchedFields]) {
      setTouched({
        ...touched,
        [name]: true,
      });
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDirectLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      // Mark all fields as touched to show errors
      setTouched({
        email: true,
        password: true,
      });
      return;
    }

    // Show loading state
    showLoading();

    try {
      if (!formData.email || !formData.password) {
        hideLoading();
        showError("Login Failed", "Please enter both email and password");
        return;
      }

      // Changed from "keycloak-direct" to "credentials"
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email, // Changed from username to email
        password: formData.password,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        console.log("Login failed with error:", result.error);
        hideLoading();

        if (result.error.includes("Account is not fully set up")) {
          showError(
            "Email Verification Required",
            "Please verify your email before logging in. Check your inbox for a verification email."
          );
        } else {
          showError("Login Failed", result.error);
        }
      } else {
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 1000);
      }
    } catch (error) {
      hideLoading();

      if (error instanceof Error) {
        showError("Login Error", "An error occurred during login", error.message);
      } else {
        showError("Login Error", "An unexpected error occurred during login");
      }
    } finally {
      hideLoading();
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    showLoading();
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      hideLoading();
      if (error instanceof Error) {
        showError("Google Login Error", "An error occurred during Google login", error.message);
      } else {
        showError("Google Login Error", "An unexpected error occurred during Google login");
      }
    }
  };

  const handleRegistrationSuccess = (email: string) => {
    setFormData({
      ...formData,
      email: email,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-6 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-black p-4 sm:p-5 md:p-6">
          <h2 className="text-xl sm:text-xl md:text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">Log in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleDirectLogin} className="p-6 sm:p-7 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Email */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-800">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                touched.email && errors.email ? "border-red-500" : "border-gray-200"
              } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
              placeholder="example@email.com"
              disabled={isLoading}
            />
            {touched.email && errors.email && <p className="text-xs sm:text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-800">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                touched.password && errors.password ? "border-red-500" : "border-gray-200"
              } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {touched.password && errors.password && <p className="text-xs sm:text-sm text-red-500">{errors.password}</p>}
          </div>

          {/* Forgot Password Link */}
          <button type="button" onClick={() => setIsForgotPasswordOpen(true)} className="text-xs sm:text-sm text-black hover:underline">
            Forgot password?
          </button>

          {/* Action buttons */}
          <div className="pt-4 sm:pt-5 md:pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white rounded-xl transition-all shadow-md ${
                isFormValid && !isLoading ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </div>

          {/* Create Account Section */}
          <div className="text-center pt-3 sm:pt-4 border-t border-gray-200 mt-4 sm:mt-5 md:mt-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Do not have an account?</p>
            <button
              type="button"
              onClick={() => setIsRegistrationOpen(true)}
              disabled={isLoading}
              className="w-full px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all shadow-sm"
            >
              Create Account
            </button>
          </div>
        </form>

        {/* OAuth Section - Google Sign In (outside the form) */}
        <div className="px-6 sm:px-7 md:px-8 pb-6 sm:pb-7 md:pb-8">
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-full border-t border-gray-300"></div>
            <div className="absolute px-4 bg-white text-xs sm:text-sm text-gray-600 font-medium">or sign in with</div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 text-sm font-medium text-gray-800 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
        </div>
      </div>

      {/* Only render the RegistrationDialog when isRegistrationOpen is true */}
      {isRegistrationOpen && (
        <RegistrationDialog
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {isForgotPasswordOpen && <ForgotPasswordDialog isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />}
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoadingFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
