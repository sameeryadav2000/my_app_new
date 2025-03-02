// src/app/components/Navbar.tsx

"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu } from "lucide-react";
import LoginLogout from "../components/LoginLogout";
import Spacer from "./Spacer";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();

  // const toggleMenu = () => {
  //   setIsMenuOpen((prev) => !prev);
  // };

  return (
    <div className="relative">
      <Spacer />

      <nav className="p-4 justify-between flex bg-[#5B4B49] w-[95%] mx-auto rounded-xl items-center">
        <div className="flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="40"
            height="40"
            className="text-yellow-500"
          >
            <rect
              x="5"
              y="2"
              width="14"
              height="20"
              rx="3"
              ry="3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="12"
              cy="19"
              r="1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <rect
              x="7"
              y="4"
              width="10"
              height="13"
              rx="1"
              ry="1"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        <div className="flex items-center justify-center flex-1">
          <h1 className="text-[#FFC107] font-extrabold text-2xl">
            R E c E L L
          </h1>
        </div>

        {/* <div className="flex">
          <div className="flex items-center justify-center pr-4">
            <LoginLogout />
          </div>

          <div className="flex items-center justify-center cursor-pointer">
            <Link href="/homepage/cart_page">
              <div className="relative transition-colors">
                <ShoppingCart className="md:w-8 md:h-8 w-6 h-6 text-white hover:text-[#FFC107] transition-all duration-300" />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-2 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    {cart.totalItems}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div> */}
      </nav>

      <Spacer />
    </div>
  );
}
