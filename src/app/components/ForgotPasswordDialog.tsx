"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/context/NotificationContext"; // Adjust import path as needed
import { useLoading } from "@/context/LoadingContext"; // Adjust import path as needed

interface ForgotPasswordData {
  email: string;
}

interface FormErrors {
  email?: string;
}

interface TouchedFields {
  email: boolean;
}

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordDialog({ isOpen, onClose }: ForgotPasswordDialogProps) {
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
  });
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Use notification and loading contexts
  const { showError, showSuccess } = useNotification();
  const { showLoading, hideLoading, isLoading } = useLoading();

  // Validate form on data change
  useEffect(() => {
    validateForm();
  }, [formData]);

  // Close dialog with escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

  // Prevent scrolling of background when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
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

    // Mark all fields as touched on submit
    setTouched({
      email: true,
    });

    // Re-validate the form
    validateForm();

    if (!isFormValid) {
      return;
    }

    showLoading();

    try {
      const response = await fetch("/api/auth/forgot_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        showError("Request Failed", result.message || "We couldn't process your request. Please try again later.");
        return;
      }

      setIsSubmitted(true);
      showSuccess("Email Sent", "If an account exists with this email, you will receive password reset instructions.");
    } catch (error) {
      showError("Request Failed", "An error occurred while processing your request. Please try again later.");
    } finally {
      hideLoading();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ email: "" });
      setTouched({ email: false });
      setIsSubmitted(false);
      onClose();
    }
  };

  // Inside your ForgotPasswordDialog component
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-6 overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-black p-5 sm:p-6 md:p-7 flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-xl md:text-2xl font-bold text-white">Forgot Password</h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">Reset your password</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
            aria-label="Close dialog"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 md:p-8">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
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
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3.5 border ${
                    touched.email && errors.email ? "border-red-500" : "border-gray-200"
                  } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
                  placeholder="example@email.com"
                  disabled={isLoading}
                />
                {touched.email && errors.email && <p className="text-xs sm:text-sm text-red-500">{errors.email}</p>}
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all shadow-sm"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 text-xs sm:text-sm font-semibold text-white rounded-xl transition-all shadow-md ${
                    isFormValid && !isLoading ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-xs sm:text-sm">Sending...</span>
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-5 md:py-6">
              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Check Your Email</h3>
              <p className="text-xs sm:text-sm text-gray-600 px-2 sm:px-4">
                If an account exists with the email <span className="font-medium">{formData.email}</span>, you will receive password reset
                instructions.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-4 sm:mt-5 md:mt-6 inline-block px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-xl transition-all shadow-md"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
