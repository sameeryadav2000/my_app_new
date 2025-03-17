"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

// Define notification types
export type NotificationType = "error" | "success" | "info" | "warning";

// Define the structure for notifications
export type NotificationInfo = {
  type: NotificationType;
  title: string;
  message: string;
  details?: string;
  duration?: number; // Duration in milliseconds (auto-close for info/success)
};

// Define the context type
type NotificationContextType = {
  showNotification: (notification: NotificationInfo) => void;
  hideNotification: () => void;
  // Convenience methods
  showError: (title: string, message: string, details?: string) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
};

// Create the context with a default value
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Props for the provider component
type NotificationProviderProps = {
  children: ReactNode;
};

// Create the provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationInfo | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);

  const clearAutoCloseTimer = useCallback(() => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
  }, [autoCloseTimer]);

  const hideNotification = useCallback(() => {
    clearAutoCloseTimer();
    setIsOpen(false);
    // Clear the notification after animation completes
    setTimeout(() => setNotification(null), 300);
  }, [clearAutoCloseTimer]);

  const showNotification = useCallback(
    (notificationInfo: NotificationInfo) => {
      // Clear any existing timer
      clearAutoCloseTimer();

      setNotification(notificationInfo);
      setIsOpen(true);

      // Auto-close for non-error notifications if duration is provided
      if (notificationInfo.type !== "error" && notificationInfo.duration) {
        const timer = setTimeout(() => {
          hideNotification();
        }, notificationInfo.duration);

        setAutoCloseTimer(timer);
      }
    },
    [clearAutoCloseTimer, hideNotification]
  );

  // Convenience methods
  const showError = useCallback(
    (title: string, message: string, details?: string) => {
      showNotification({ type: "error", title, message, details });
    },
    [showNotification]
  );

  const showSuccess = useCallback(
    (title: string, message: string, duration = 5000) => {
      showNotification({ type: "success", title, message, duration });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration = 4000) => {
      showNotification({ type: "info", title, message, duration });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration = 6000) => {
      showNotification({ type: "warning", title, message, duration });
    },
    [showNotification]
  );

  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-400",
          title: "text-red-700",
          icon: "❌",
          button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        };
      case "success":
        return {
          bg: "bg-green-100",
          border: "border-green-500",
          title: "text-green-800",
          icon: "✅",
          button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-400",
          title: "text-blue-700",
          icon: "ℹ️",
          button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-400",
          title: "text-yellow-700",
          icon: "⚠️",
          button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
        };
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        hideNotification,
        showError,
        showSuccess,
        showInfo,
        showWarning,
      }}
    >
      {children}
      {isOpen &&
        notification &&
        (() => {
          const styles = getTypeStyles(notification.type);

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className={`rounded-lg shadow-lg p-6 max-w-md w-full mx-4 border ${styles.border} ${styles.bg}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-semibold flex items-center ${styles.title}`}>
                    <span className="mr-2">{styles.icon}</span>
                    {notification.title}
                  </h2>
                  <button onClick={hideNotification} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-gray-700">{notification.message}</p>
                  {notification.details && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto max-h-32">
                      <pre className="whitespace-pre-wrap">{notification.details}</pre>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={hideNotification}
                    className={`px-4 py-2 text-white rounded focus:outline-none focus:ring-2 ${styles.button}`}
                  >
                    {notification.type === "error" ? "Close" : "OK"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification system
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
