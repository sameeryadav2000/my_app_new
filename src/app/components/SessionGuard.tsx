"use client";
import { signIn, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { ReactNode, useEffect } from "react";

interface ExtendedSession extends Session {
  error?: string;
}

export default function SessionGuard({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  
  useEffect(() => {
    if ((session as ExtendedSession)?.error === "RefreshAccessTokenError") {
      signIn("keycloak");
    }
  }, [session]);

  return <>{children}</>;
}