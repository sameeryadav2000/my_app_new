"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { useLoading } from "@/context/LoadingContext";
import RegistrationDialog from "@/app/components/RegistrationDialog";
import ForgotPasswordDialog from "@/app/components/ForgotPasswordDialog";

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

export default function LoginPage() {
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
  const { showError, showSuccess } = useNotification();
  const { showLoading, hideLoading, isLoading } = useLoading();

  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

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

      const result = await signIn("keycloak-direct", {
        redirect: false,
        username: formData.email,
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
          showError("Login Failed", "Invalid email or password");
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

  // Handle successful registration
  const handleRegistrationSuccess = (email: string) => {
    setFormData({
      ...formData,
      email: email,
    });
    showSuccess(
      "Registration Successful",
      "Your account has been created! Please check your email to verify your account before logging in."
    );
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
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Don't have an account?</p>
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
