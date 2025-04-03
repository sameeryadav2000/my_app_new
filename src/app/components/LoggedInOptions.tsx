"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { LogOut, User, Package } from "lucide-react";

interface AccountDropdownProps {
  session: Session | null;
  onLogout: () => void;
}

export default function LoggedInOptions({ session, onLogout }: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
  }, [isOpen, dropdownRef]);

  return (
    <div className="relative dropdown" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none"
        aria-label="Account menu"
      >
        <div className="w-5 h-5 md:w-6 md:h-6 bg-black text-white flex items-center justify-center rounded-full text-sm font-medium">
          {firstLetter}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed md:absolute inset-x-0 md:inset-auto md:right-0 md:top-full mt-5 md:mt-2 z-50">
          <div className="mx-4 md:mx-0 md:w-64">
            <div className="bg-white rounded-lg shadow-lg py-2 border border-gray-200">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <div className="text-sm font-medium text-black capitalize">{session?.user?.name}</div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/home/account"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200"
                >
                  <User className="w-4 h-4 md:w-5 md:h-5" />
                  Account
                </Link>

                <Link
                  href="/home/orders"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200"
                >
                  <Package className="w-4 h-4 md:w-5 md:h-5" />
                  Orders
                </Link>

                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200 w-full text-left"
                >
                  <LogOut className="w-4 h-4 md:w-5 md:h-5" />
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
