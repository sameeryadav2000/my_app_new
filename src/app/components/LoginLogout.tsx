"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import federatedLogout from "@/utils/federatedLogout";
import { User, Loader2 } from "lucide-react";
import LoggedInOptions from "./LoggedInOptions";
import { usePathname } from "next/navigation";

export default function LoginLogout() {
  const { data: session } = useSession();
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    federatedLogout();
  };

  const handleClick = () => {
    setIsNavigating(true);

    setTimeout(() => {
      setIsNavigating(false);
    }, 2000);
  };

  if (session) {
    return <LoggedInOptions session={session} onLogout={handleLogout} />;
  }

  if (isNavigating) {
    return (
      <div className="inline-flex items-center">
        <Loader2 className="w-7 h-7 text-gray-700 animate-spin" />
      </div>
    );
  }

  return (
    <Link
      href={{
        pathname: "/login_signup",
        query: { callbackUrl: pathname },
      }}
      onClick={handleClick}
      className="p-2 text-gray-700 hover:text-black focus:outline-none hover:bg-gray-100 rounded-full transition-colors duration-200"
      aria-label="Login or Signup"
    >
      <User className="w-6 h-6" />
    </Link>
  );
}
