"use client";
import { signOut, useSession } from "next-auth/react";
import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import federatedLogout from "@/utils/federatedLogout";

// Define the inactivity timeout threshold to match Keycloak's SSO Session Max (24 hours)
const EXTENDED_INACTIVITY_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

export default function SessionGuard({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Function to update the last activity timestamp
  const updateActivityTimestamp = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastActivityTimestamp", Date.now().toString());
    }
  }, []);

  // Function to check for extended inactivity
  const checkExtendedInactivity = useCallback(() => {
    if (typeof window === "undefined" || !session) return;

    const lastActivityStr = localStorage.getItem("lastActivityTimestamp");

    if (lastActivityStr) {
      const lastActivity = parseInt(lastActivityStr, 10);
      const inactivityDuration = Date.now() - lastActivity;

      // If user has been inactive for longer than the threshold
      if (inactivityDuration >= EXTENDED_INACTIVITY_THRESHOLD) {
        // Set redirecting state to show loading UI
        setIsRedirecting(true);

        // Use your existing federated logout utility
        federatedLogout().catch(() => {
          // If federated logout fails, just do a normal sign out
          signOut({ redirect: false }).then(() => {
            router.push("/login_signup");
          });
        });
      }
    } else {
      // Initialize the timestamp if it doesn't exist
      updateActivityTimestamp();
    }
  }, [session, router, updateActivityTimestamp]);

  // Handle refresh token errors
  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      setIsRedirecting(true);

      // Properly sign out instead of just redirecting
      signOut({ redirect: false }).then(() => {
        // Store message for login page
        localStorage.setItem("sessionExpiredMessage", "Your session has expired. Please log in again.");
        router.push("/login_signup");
      });
    }
  }, [session, router]);

  // Effect for tracking user activity and checking for extended inactivity
  useEffect(() => {
    if (typeof window === "undefined" || !session) return;

    checkExtendedInactivity();

    updateActivityTimestamp();

    const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];

    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedUpdateActivity = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateActivityTimestamp, 1000);
    };

    // Add all event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, debouncedUpdateActivity);
    });

    // Clean up event listeners
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, debouncedUpdateActivity);
      });
      clearTimeout(timeoutId);
    };
  }, [session, checkExtendedInactivity, updateActivityTimestamp]);

  // Show a loading state while redirecting
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center p-6 rounded-lg">
          <div className="mb-4">
            <svg
              className="animate-spin h-10 w-10 text-indigo-600 mx-auto"
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
          </div>
          <p className="text-lg font-medium text-gray-900">Your session has expired</p>
          <p className="text-gray-600 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Otherwise return children normally
  return <>{children}</>;
}
