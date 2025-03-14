"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiUsers, FiPackage, FiSettings, FiMenu, FiX, FiUser } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { useSession } from "next-auth/react";

export default function DashboardSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name || "Guest";

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
    },
    {
      name: "Users",
      href: "/dashboard/users",
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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white shadow-lg transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <FiHome className="w-6 h-6 text-[#5B4B49]" />
            <span className="ml-2 text-lg font-bold text-[#5B4B49]">Admin Dashboard</span>
          </div>
          <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-gray-100 lg:hidden">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* User welcome section */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#5B4B49] flex items-center justify-center text-white">
                <FiUser />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Welcome,</p>
              <h3 className="text-base font-semibold text-[#5B4B49] truncate capitalize">{userName}</h3>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-[#5B4B49] rounded-md transition-all duration-200 hover:bg-gray-100 ${
                    pathname === item.href ? "bg-[#5B4B49] bg-opacity-10 font-medium text-[#5B4B49]" : ""
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                  {pathname === item.href && <span className="ml-auto w-1.5 h-5 rounded-full bg-[#5B4B49]"></span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout section at bottom */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <Link href="/api/auth/signout" className="flex items-center px-4 py-3 text-gray-600 rounded-md hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
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
            <span className="ml-3">Logout</span>
          </Link>
        </div>
      </div>

      {/* Mobile header with toggle button */}
      <div className="lg:hidden fixed top-0 right-0 z-30 p-4">
        <button onClick={toggleSidebar} className="p-2 rounded-md bg-white shadow-md hover:bg-gray-100">
          <FiMenu className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}
