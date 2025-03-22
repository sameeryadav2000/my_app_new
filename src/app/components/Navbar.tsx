"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import LoginLogout from "../components/LoginLogout";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { cart } = useCart();

  return (
    <div className="w-full">
      <header className="bg-white py-4 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold tracking-wider text-black">RECELL</span>
            </Link>

            {/* Right Navigation */}
            <div className="flex items-center space-x-5">
              {/* User Account/Login */}
              <LoginLogout />

              {/* Cart */}
              <Link href="/homepage/cart_page" className="relative p-1.5 text-gray-700 hover:text-black">
                <ShoppingBag size={20} />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cart.totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-6"></div>
    </div>
  );
}
