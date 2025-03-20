"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiUsers, FiPackage, FiSettings, FiMenu, FiX, FiUser } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { useSession } from "next-auth/react";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
  },
  {
    name: "Sellers",
    href: "/dashboard/sellers",
    icon: <FiUsers className="w-5 h-5" />,
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: <FiPackage className="w-5 h-5" />,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: <FiSettings className="w-5 h-5" />,
  },
];

export default function DashboardSidebar() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const userName = session?.user?.name;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 h-16 z-20 flex items-center justify-between px-4 py-3 bg-black text-white lg:hidden border-b border-[#333333]">
        <div className="flex items-center">
          <FiHome className="w-6 h-6" />
          <span className="ml-3 text-lg font-bold">Admin Dashboard</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-[#555555]"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        bg-white border-r border-[#e0e0e0] shadow-md lg:mt-0 mt-16`}
      >
        {/* Header with logo - only visible on desktop */}
        <div className="hidden lg:flex items-center justify-between p-6 border-b border-[#e0e0e0]">
          <div className="flex items-center">
            <FiHome className="w-6 h-6 text-black" />
            <span className="ml-3 text-lg font-bold text-black">Admin Dashboard</span>
          </div>
        </div>

        {/* User profile section */}
        <div className="px-6 py-5 border-b border-[#e0e0e0]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white">
                <FiUser className="w-6 h-6" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[#999999]">Welcome,</p>
              <h3 className="text-base font-semibold text-black truncate capitalize">{userName || "User"}</h3>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-5">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-5 py-3.5 rounded-md transition-all duration-200 
                  ${pathname === item.href ? "bg-black text-white font-medium" : "text-[#555555] hover:bg-[#f7f7f7]"}`}
                >
                  <span className="flex-shrink-0 w-6 h-6">{item.icon}</span>
                  <span className="ml-4 text-base">{item.name}</span>
                  {pathname === item.href && <span className="ml-auto w-1.5 h-5 rounded-full bg-white"></span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout section */}
        <div className="absolute bottom-0 w-full px-4 py-5 border-t border-[#e0e0e0]">
          <Link
            href="/api/auth/signout"
            className="flex items-center px-5 py-3.5 text-[#555555] rounded-md hover:bg-[#f7f7f7] transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span className="ml-4 text-base">Logout</span>
          </Link>
        </div>
      </div>
    </>
  );
}
