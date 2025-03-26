"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/context/NotificationContext"; // Adjust import path as needed
import { useLoading } from "@/context/LoadingContext"; // Adjust import path as needed

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

interface TouchedFields {
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  firstName: boolean;
  lastName: boolean;
}

interface RegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function RegistrationDialog({ isOpen, onClose, onSuccess }: RegistrationDialogProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    password: false,
    confirmPassword: false,
    firstName: false,
    lastName: false,
  });
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

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

    // Validate firstName
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Validate lastName
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

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

    // Validate confirmPassword
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

    // Mark all fields as touched on submit
    const allTouched: TouchedFields = {
      email: true,
      password: true,
      confirmPassword: true,
      firstName: true,
      lastName: true,
    };
    setTouched(allTouched);

    // Re-validate the form
    validateForm();

    if (!isFormValid) {
      return;
    }

    showLoading();

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        showError("Registration Failed", result.message);
        return;
      }

      showSuccess("Registration Successful", result.message);

      setTimeout(() => {
        onSuccess(formData.email);
        onClose();
      }, 2000);
    } catch (error) {
      showError("Registration Failed", "An error occurred during registration. Please try again later.");
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-6 overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-black p-5 sm:p-6 md:p-7 flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-xl md:text-2xl font-bold text-white">Create Account</h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">Sign up to get started</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* First Name */}
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="firstName" className="block text-xs sm:text-sm font-semibold text-gray-800">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 border ${
                  touched.firstName && errors.firstName ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
                placeholder="Enter first name"
                disabled={isLoading}
              />
              {touched.firstName && errors.firstName && <p className="text-xs sm:text-sm text-red-500">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="lastName" className="block text-xs sm:text-sm font-semibold text-gray-800">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 border ${
                  touched.lastName && errors.lastName ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
                placeholder="Enter last name"
                disabled={isLoading}
              />
              {touched.lastName && errors.lastName && <p className="text-xs sm:text-sm text-red-500">{errors.lastName}</p>}
            </div>
          </div>

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
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 border ${
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
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 border ${
                touched.password && errors.password ? "border-red-500" : "border-gray-200"
              } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
              placeholder="Create password (min. 8 characters)"
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
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 border ${
                touched.confirmPassword && errors.confirmPassword ? "border-red-500" : "border-gray-200"
              } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-xs sm:text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
                  <span className="text-xs sm:text-sm">Creating Account...</span>
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
