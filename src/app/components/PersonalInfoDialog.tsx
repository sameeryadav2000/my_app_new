"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useNotification } from "@/context/NotificationContext";
import { useLoading } from "@/context/LoadingContext";

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface FormErrors {
  phoneNumber?: string;
}

interface TouchedFields {
  phoneNumber: boolean;
}

interface PersonalInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalInfoDialog({ isOpen, onClose }: PersonalInfoDialogProps) {
  const { data: session, update } = useSession();
  const { showError, showSuccess } = useNotification();
  const { showLoading, hideLoading, isLoading } = useLoading();

  const [formData, setFormData] = useState<PersonalInfoData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const [touched, setTouched] = useState<TouchedFields>({
    phoneNumber: false,
  });

  // Load user data from session when component mounts
  useEffect(() => {
    if (session?.user) {
      setFormData({
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
        email: session.user.email || "",
        phoneNumber: session.user.phoneNumber || "",
      });
    }
  }, [session]);

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};

    // Basic phone number validation
    if (formData.phoneNumber && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [formData]);

  // Validate form on data change
  useEffect(() => {
    validateForm();
  }, [validateForm]);

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

    if (!isFormValid) {
      // Mark phoneNumber field as touched to show errors
      setTouched({
        ...touched,
        phoneNumber: true,
      });
      return;
    }

    // Show loading state
    showLoading();

    try {
      const response = await fetch("/api/user/update_phone", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        showError("Error", result.message);
        return;
      }

      showSuccess("Success", result.message || "Phone number updated successfully");

      // Update session data (optional)
      await update({
        ...session,
        user: {
          ...session?.user,
          phoneNumber: formData.phoneNumber,
        },
      });

      onClose();
    } catch (error) {
      showError("Error", "Error updating phone number. Please check your connection and try again.");
    } finally {
      hideLoading();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-6 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-black p-4 sm:p-5 md:p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-xl md:text-2xl font-bold text-white">Personal Information</h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">Manage your personal details</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors" disabled={isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
          {/* First Name - Uneditable */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="firstName" className="block text-xs sm:text-sm font-semibold text-gray-800">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed shadow-sm text-xs sm:text-sm"
              disabled
            />
          </div>

          {/* Last Name - Uneditable */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="lastName" className="block text-xs sm:text-sm font-semibold text-gray-800">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed shadow-sm text-xs sm:text-sm"
              disabled
            />
          </div>

          {/* Email - Uneditable */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-800">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed shadow-sm text-xs sm:text-sm"
              disabled
            />
          </div>

          {/* Phone Number - Editable */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="phoneNumber" className="block text-xs sm:text-sm font-semibold text-gray-800">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border ${
                touched.phoneNumber && errors.phoneNumber ? "border-red-500" : "border-gray-200"
              } rounded-xl focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-xs sm:text-sm`}
              disabled={isLoading}
            />
            {touched.phoneNumber && errors.phoneNumber && <p className="text-xs sm:text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>

          {/* Action buttons */}
          <div className="pt-4 sm:pt-5 md:pt-6">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white rounded-xl transition-all shadow-md ${
                isFormValid && !isLoading ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Cancel option */}
          <div className="text-center pt-3 sm:pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="text-xs sm:text-sm text-black hover:underline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
