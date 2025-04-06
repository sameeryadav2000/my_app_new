// E:\my_app_new\src\app\home\layout.tsx

import "./globals.css";
import { Kalam } from "next/font/google";
import type { Metadata } from "next";
import Navbar from "@/src/app/components/Navbar";
import AuthProvider from "@/src/app/components/AuthProvider";
import SessionGuard from "@/src/app/components/SessionGuard";
import { CartProvider } from "@/src/context/CartContext";
import Footer from "@/src/app/components/Footer";
import { LoadingProvider } from "@/src/context/LoadingContext";
import { NotificationProvider } from "@/src/context/NotificationContext";

const kalam = Kalam({
  weight: ["400", "700"], // Regular and Bold weights
  subsets: ["latin"],
  display: "swap",
  variable: "--font-kalam",
});

export const metadata: Metadata = {
  title: {
    template: "%s | MobileLoom",
    default: "MobileLoom - Premium Smartphones in Nepal",
  },
  description:
    "Find the latest iPhone, Samsung, Xiaomi, and Vivo phones in Nepal with updated prices. Compare specifications and features of popular smartphones available in Nepal.",
  keywords: "iPhone Nepal, Samsung Nepal, Xiaomi Nepal, Vivo Nepal, smartphone prices Nepal, mobile phone Nepal, latest phones Nepal",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://mobileloom.com",
  },
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={kalam.variable}>
      <body>
        <AuthProvider>
          <SessionGuard>
            <LoadingProvider>
              <NotificationProvider>
                <CartProvider>
                  <Navbar />
                  <div className="min-h-screen">{children}</div>
                  <Footer />
                </CartProvider>
              </NotificationProvider>
            </LoadingProvider>
          </SessionGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
