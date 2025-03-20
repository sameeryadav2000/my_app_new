"use client";

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

interface LoadingContextType {
  isLoading: boolean;
  showLoading: (timeoutMs?: number) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
  defaultTimeout?: number;
}

export function LoadingProvider({
  children,
  defaultTimeout = 30000, // Default 30 second safety timeout
}: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing timeout
  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout();
  }, [clearTimeout]);

  const showLoading = useCallback(
    (timeoutMs?: number) => {
      setIsLoading(true);

      // Clear any existing timeout first
      clearTimeout();

      // Set safety timeout to automatically hide loading after specified time
      // This prevents UI being stuck in loading state indefinitely
      if (timeoutMs !== 0) {
        // If 0, don't set a timeout
        const timeout = timeoutMs || defaultTimeout;
        timeoutRef.current = setTimeout(() => {
          hideLoading();
          console.warn("Loading state automatically cleared after timeout");
        }, timeout);
      }
    },
    [clearTimeout, defaultTimeout]
  );

  const hideLoading = useCallback(() => {
    clearTimeout();
    setIsLoading(false);
  }, [clearTimeout]);

  const contextValue = {
    isLoading,
    showLoading,
    hideLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <LoadingScreen isLoading={isLoading} />
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextType {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
