// E:\my_app_new\src\app\components\LoginLogout.tsx

"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import federatedLogout from "@/utils/federatedLogout";
import { User } from "lucide-react";
import LoggedInOptions from "./LoggedInOptions";

export default function LoginLogout() {
  const { data: session } = useSession();

  const handleLogout = () => {
    federatedLogout();
  };

  if (session) {
    return <LoggedInOptions session={session} onLogout={handleLogout} />;
  }

  return (
    <Link
      href="/login_signup"
      className="inline-flex items-center hover:opacity-80 transition-opacity duration-200"
    >
      <User className="md:w-8 md:h-8 w-6 h-6 text-white" />
    </Link>
  );
}
