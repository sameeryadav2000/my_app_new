"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PersonalInfoDialog from "@/app/components/PersonalInfoDialog";
import ShippingInfoDialog from "@/app/components/ShippingInfoDialog";
import { useLoading } from "@/context/LoadingContext";

export interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function Account() {
  const { data: session } = useSession();
  const { showLoading, hideLoading } = useLoading();

  const [isPersonalInfoDialogOpen, setIsPersonalInfoDialogOpen] = useState(false);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [savedShippingInfo, setSavedShippingInfo] = useState<ShippingData | null>(null);

  // Fetch shipping info on component mount
  useEffect(() => {
    const fetchShippingInfo = async () => {
      showLoading();

      try {
        const storedShippingInfo = sessionStorage.getItem("shippingInfo");

        if (storedShippingInfo) {
          const parsedInfo = JSON.parse(storedShippingInfo);
          setSavedShippingInfo(parsedInfo);
          hideLoading();
          return;
        }

        const response = await fetch("/api/shipping", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!result.success) {
          console.error("Failed to fetch shipping info:", result.message);
          return;
        }

        setSavedShippingInfo(result.shippingInfo);
        sessionStorage.setItem("shippingInfo", JSON.stringify(result.shippingInfo));
      } catch (error) {
        console.error("Error fetching shipping info:", error);
      } finally {
        hideLoading();
      }
    };

    fetchShippingInfo();
  }, [hideLoading, showLoading]);

  const openPersonalInfoDialog = () => setIsPersonalInfoDialogOpen(true);
  const closePersonalInfoDialog = () => setIsPersonalInfoDialogOpen(false);

  const openShippingDialog = () => setIsShippingDialogOpen(true);
  const closeShippingDialog = () => setIsShippingDialogOpen(false);

  const handleShippingSuccess = (shippingInfo: ShippingData) => {
    setSavedShippingInfo(shippingInfo);
    sessionStorage.setItem("shippingInfo", JSON.stringify(shippingInfo));
    closeShippingDialog();
  };

  return (
    <div className="w-[95%] md:w-[70%] mx-auto py-8">
      {/* Centered title */}
      <h1 className="text-2xl font-bold mb-6 text-center">My Account</h1>

      {/* Two-column layout for desktop, stacked for mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {/* Personal Information Box - Left side on large screens */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-5 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Personal Information</h2>
            <button
              onClick={openPersonalInfoDialog}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-black text-white rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black text-xs sm:text-sm font-semibold transition-all"
            >
              Edit
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Name</p>
              <p className="font-medium text-sm sm:text-base capitalize">
                {session?.user?.firstName} {session?.user?.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Email</p>
              <p className="font-medium text-sm sm:text-base break-words">{session?.user?.email}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Phone Number</p>
              <p className="font-medium text-sm sm:text-base">{session?.user?.phoneNumber || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* Shipping Information Box - Right side on large screens */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-5 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Shipping Information</h2>
            <button
              onClick={openShippingDialog}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-black text-white rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black text-xs sm:text-sm font-semibold transition-all"
            >
              {savedShippingInfo ? "Edit" : "Add"}
            </button>
          </div>

          {savedShippingInfo ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">
                    {savedShippingInfo.firstName} {savedShippingInfo.lastName}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">{savedShippingInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0 mt-1">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-700 text-sm sm:text-base">
                    {savedShippingInfo.address},<br />
                    {savedShippingInfo.city}, {savedShippingInfo.state} {savedShippingInfo.zipCode}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">{savedShippingInfo.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 py-6">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">No shipping information saved</p>
              <p className="text-gray-500 text-xs sm:text-sm text-center max-w-xs">Add your shipping details for faster checkout</p>
            </div>
          )}
        </div>
      </div>

      {/* Personal Info Dialog */}
      {isPersonalInfoDialogOpen && <PersonalInfoDialog isOpen={isPersonalInfoDialogOpen} onClose={closePersonalInfoDialog} />}

      {/* Shipping Info Dialog */}
      {isShippingDialogOpen && (
        <ShippingInfoDialog
          isOpen={isShippingDialogOpen}
          onClose={closeShippingDialog}
          onSuccess={handleShippingSuccess}
          initialData={savedShippingInfo}
        />
      )}
    </div>
  );
}
