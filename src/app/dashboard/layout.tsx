import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/app/components/AuthProvider";
import SessionGuard from "@/app/components/SessionGuard";
import { LoadingProvider } from "@/context/LoadingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import DashboardSidebar from "@/app/dash_components/DashboardSidebar";

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
                <div className="flex h-screen bg-gray-100">
                  <DashboardSidebar />

                  <div className="flex-1 overflow-auto">{children}</div>
                </div>
              </NotificationProvider>
            </LoadingProvider>
          </SessionGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
