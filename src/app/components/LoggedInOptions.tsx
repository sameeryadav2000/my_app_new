"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { RiAccountCircleFill, RiLogoutBoxLine } from "react-icons/ri";
import { FiPackage } from "react-icons/fi";
import { AiOutlineHeart } from "react-icons/ai";
import { MdDashboard } from "react-icons/md";

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
      <button onClick={toggleDropdown} className="flex items-center gap-2 hover:opacity-80 transition-colors">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-[#7D6167] text-white flex items-center justify-center rounded-full text-lg font-bold">
          {firstLetter}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed md:absolute inset-x-0 md:inset-auto md:right-0 md:top-full mt-5 md:mt-2 z-50">
          <div className="mx-4 md:mx-0 md:w-72">
            <div className="bg-[#DAD3C9] rounded-lg shadow-lg py-2 border border-gray-100">
              {/* User Info */}
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <div className="text-sm font-bold text-[#5B4B49] capitalize">{session?.user?.name}</div>
                {session?.user?.admin && (
                  <Link
                    href="/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#5B4B49] font-bold hover:opacity-80 flex items-center gap-1 px-2 py-1 border border-[#5B4B49] rounded shadow-sm hover:shadow-md transition-all"
                  >
                    <MdDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link href="" className="flex items-center gap-3 px-4 py-3 md:py-2 text-sm text-[#5B4B49] font-bold hover:bg-gray-50">
                  <RiAccountCircleFill className="w-5 h-5" />
                  Account
                </Link>

                <Link
                  href="/homepage/orders"
                  className="flex items-center gap-3 px-4 py-3 md:py-2 text-sm text-[#5B4B49] font-bold hover:bg-gray-50"
                >
                  <FiPackage className="w-5 h-5" />
                  Orders
                </Link>

                <Link
                  href="/favorites"
                  className="flex items-center gap-3 px-4 py-3 md:py-2 text-sm text-[#5B4B49] font-bold hover:bg-gray-50"
                >
                  <AiOutlineHeart className="w-5 h-5" />
                  Favorites
                </Link>

                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 md:py-2 text-sm text-[#5B4B49] font-bold hover:bg-gray-50 w-full"
                >
                  <RiLogoutBoxLine className="w-5 h-5" />
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
