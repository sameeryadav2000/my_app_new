import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/app/components/AuthProvider";
import SessionGuard from "@/app/components/SessionGuard";
import { LoadingProvider } from "@/context/LoadingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import DashboardSidebar from "@/app/dash_components/Sidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for your application",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SessionGuard>
            <LoadingProvider>
              <NotificationProvider>
                <div className="flex h-screen">
                  <DashboardSidebar />

                  <div className="flex-1 overflow-auto lg:pt-0 pt-16">{children}</div>
                </div>
              </NotificationProvider>
            </LoadingProvider>
          </SessionGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
