// src/app/homepage/product_page/[id]/[title]/layout.tsx
import React from "react";

// Simplest possible layout component
export default function ProductPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// We can add the metadata function back after fixing the layout
