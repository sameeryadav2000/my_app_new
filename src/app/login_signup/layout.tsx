import { LoadingProvider } from "@/context/LoadingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MobileLoom",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LoadingProvider>
          <NotificationProvider>
            <div className="min-h-screen">{children}</div>
          </NotificationProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}

{
  /* <html lang="en">
  <body>
    <AuthProvider>
      <SessionGuard>
        <LoadingProvider>
          <CartProvider>
            <NotificationProvider>
              <Navbar />
              <div className="min-h-screen">{children}</div>
              <Footer />
            </NotificationProvider>
          </CartProvider>
        </LoadingProvider>
      </SessionGuard>
    </AuthProvider>
  </body>
</html>; */
}
