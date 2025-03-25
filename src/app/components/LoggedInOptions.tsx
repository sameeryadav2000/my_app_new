"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { LogOut, User, Package, Heart, LayoutDashboard } from "lucide-react";

interface AccountDropdownProps {
  session: Session | null;
  onLogout: () => void;
}

export default function LoggedInOptions({ session, onLogout }: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const firstName = session?.user?.firstName;
  const firstLetter = firstName?.charAt(0)?.toUpperCase() || "?";

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative dropdown" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none"
        aria-label="Account menu"
      >
        <div className="w-7 h-7 bg-black text-white flex items-center justify-center rounded-full text-sm font-medium">{firstLetter}</div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed md:absolute inset-x-0 md:inset-auto md:right-0 md:top-full mt-5 md:mt-2 z-50">
          <div className="mx-4 md:mx-0 md:w-64">
            <div className="bg-white rounded-lg shadow-lg py-2 border border-gray-200">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <div className="text-sm font-medium text-black capitalize">{session?.user?.name}</div>
                {session?.user?.admin && (
                  <Link
                    href="/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-black font-medium hover:bg-gray-100 flex items-center gap-1 px-2 py-1 border border-gray-200 rounded transition-colors duration-200"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>
                )}
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/homepage/account"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  Account
                </Link>

                <Link
                  href="/homepage/orders"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200"
                >
                  <Package className="w-4 h-4" />
                  Orders
                </Link>

                <Link
                  href="/favorites"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200"
                >
                  <Heart className="w-4 h-4" />
                  Favorites
                </Link>

                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
