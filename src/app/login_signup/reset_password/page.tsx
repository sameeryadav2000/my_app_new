"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { useLoading } from "@/context/LoadingContext";

interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

interface TouchedFields {
  password: boolean;
  confirmPassword: boolean;
}

// Fallback component that shows while params are loading
function ResetPasswordLoadingFallback() {
  const { showLoading } = useLoading();

  // Show global loading when component is in loading state
  showLoading();

  // Return a minimal fallback since the global loading context will handle the UI
  return null;
}

// Main content component that uses useSearchParams
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState<ResetPasswordData>({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [touched, setTouched] = useState<TouchedFields>({
    password: false,
    confirmPassword: false,
  });

  const { showError, showSuccess } = useNotification();
  const { showLoading, hideLoading, isLoading } = useLoading();

  // Hide loading once the component is rendered
  hideLoading();

  // Check if token exists on mount
  useEffect(() => {
    if (!token) {
      router.replace("/login_signup");
      showError("Invalid Request", "The reset link is invalid or has expired.");
    }
  }, [token, router, showError]);

  // Validate form on data change
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid || !token) {
      // Mark all fields as touched to show errors
      setTouched({
        password: true,
        confirmPassword: true,
      });
      return;
    }

    // Show loading state
    showLoading();

    try {
      const response = await fetch("/api/auth/reset_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        showError("Reset Failed", result.message || "We couldn't reset your password. The link may have expired.");
        return;
      }

      showSuccess("Password Reset", "Your password has been successfully reset. You can now log in with your new password.");

      // Redirect to login page after successful reset
      setTimeout(() => {
        router.push("/login_signup");
      }, 1000);
    } catch (error) {
      if (error instanceof Error) {
        showError("Reset Failed", "An error occurred while resetting your password", error.message);
      } else {
        showError("Reset Failed", "An unexpected error occurred while resetting your password");
      }
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-6 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-black p-4 sm:p-5 md:p-6">
          <h2 className="text-xl sm:text-xl md:text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">Create a new password for your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Password */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-800">
              New Password *
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
              placeholder="Enter your new password"
              disabled={isLoading}
            />
            {touched.password && errors.password && <p className="text-xs sm:text-sm text-red-500">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-gray-800">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                touched.confirmPassword && errors.confirmPassword ? "border-red-500" : "border-gray-200"
              } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
              placeholder="Confirm your new password"
              disabled={isLoading}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-xs sm:text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 sm:p-4 rounded-lg">
            <p className="font-medium mb-2">Password requirements:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>At least 8 characters long</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="pt-4 sm:pt-5 md:pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white rounded-xl transition-all shadow-md ${
                isFormValid && !isLoading ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>

          {/* Back to Login Link */}
          <div className="text-center pt-3 sm:pt-4 border-t border-gray-200 mt-4 sm:mt-5 md:mt-6">
            <p className="text-xs sm:text-sm text-gray-600">
              Remember your password?{" "}
              <button type="button" onClick={() => router.push("/login_signup")} className="text-black font-medium hover:underline">
                Back to login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
