// src/app/components/SessionExpiredAlert.tsx
"use client";

import { useEffect, useState } from "react";

export default function SessionExpiredAlert() {
  const [message, setMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for session expired message
    const expiredMessage = localStorage.getItem('sessionExpiredMessage');
    if (expiredMessage) {
      setMessage(expiredMessage);
      // Remove it after retrieving
      localStorage.removeItem('sessionExpiredMessage');
    }
  }, []);
  
  if (!message) return null;
  
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
      <p>{message}</p>
    </div>
  );
}