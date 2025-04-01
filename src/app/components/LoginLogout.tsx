"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { User } from "lucide-react";
import LoggedInOptions from "./LoggedInOptions";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import LoadingScreen from "@/app/components/LoadingScreen";

export default function LoginLogout() {
  const { data: session, status } = useSession();
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleClick = () => {
    setIsNavigating(true);

    setTimeout(() => {
      setIsNavigating(false);
    }, 2000);
  };

  return (
    <>
      {/* Determine what to render based on session status */}
      {status === "loading" ? (
        // Show spinner while session is loading
        <div className="inline-flex items-center">
          <LoadingScreen />
        </div>
      ) : session ? (
        // User is logged in - show logged in options
        <LoggedInOptions session={session} onLogout={handleLogout} />
      ) : (
        // User is not logged in - show login link or navigation spinner
        <div className="inline-flex items-center">
          {isNavigating ? (
            <LoadingScreen />
          ) : (
            <Link
              href={{
                pathname: "/login_signup",
                query: { callbackUrl: pathname },
              }}
              onClick={handleClick}
              className="p-2 text-gray-700 hover:text-black focus:outline-none hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Login or Signup"
            >
              <User className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          )}
        </div>
      )}
    </>
  );
}

// import federatedLogout from "@/utils/federatedLogout";
// const handleLogout = () => {
//   federatedLogout();
// };
