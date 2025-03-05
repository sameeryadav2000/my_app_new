"use client";

import React from "react";
import Link from "next/link";

const footerSections = {
  About: [
    { title: "Our Story", href: "/homepage/about/story" },
    { title: "Contact Us", href: "/homepage/about/contact" },
    { title: "Blog", href: "/homepage/about/blog" },
    { title: "Careers", href: "/homepage/about/careers" },
  ],
  Help: [
    { title: "FAQ", href: "/homepage/help/faq" },
    { title: "Delivery Information", href: "/homepage/help/delivery" },
    { title: "Returns", href: "/homepage/help/returns" },
    { title: "Order Status", href: "/homepage/help/order-status" },
  ],
  Services: [
    { title: "iPhone Repair", href: "/homepage/services/iphone-repair" },
    { title: "Device Trade-In", href: "/homepage/services/trade-in" },
    { title: "Insurance", href: "/homepage/services/insurance" },
    { title: "Warranty", href: "/homepage/services/warranty" },
  ],
};

export default function Footer() {

  return (
    <footer className="bg-[#5B4B49] py-12 mt-16 mb-10 w-[95%] mx-auto rounded-xl text-white">
      <div className="w-4/5 mx-auto">
        <div className="flex flex-col md:flex-row md:justify-center gap-8 md:gap-32">
          {Object.entries(footerSections).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-bold text-lg mb-4">{section}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      className="hover:text-gray-900 transition-colors duration-200"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 font-bold">
            <p className="text-sm">
              © {new Date().getFullYear()} Phone Store. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/homepage/privacy-policy"
                className="hover:text-gray-700 text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/homepage/terms"
                className="hover:text-gray-700 text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
