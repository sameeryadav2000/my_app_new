"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

// Define notification types
export type NotificationType = "error" | "success" | "info" | "warning" | "delete-confirm";

// Define type for style options
type StyleOptions = {
  bg: string;
  border: string;
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  button: string;
  buttonHover: string;
  showConfirmCancel: boolean;
  cancelButton?: string;
  cancelButtonHover?: string;
  cancelTextColor?: string;
};

// Define the structure for notifications
export type NotificationInfo = {
  type: NotificationType;
  title: string;
  message: string;
  details?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

// Define the context type
type NotificationContextType = {
  showNotification: (notification: NotificationInfo) => void;
  hideNotification: () => void;
  showError: (title: string, message: string, details?: string) => void;
  showSuccess: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showDeleteConfirmation: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

type NotificationProviderProps = {
  children: ReactNode;
};

// Create the provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationInfo | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const hideNotification = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setNotification(null), 300);
  }, []);

  const showNotification = useCallback((notificationInfo: NotificationInfo) => {
    setNotification(notificationInfo);
    setIsOpen(true);
  }, []);

  // Convenience methods
  const showError = useCallback(
    (title: string, message: string, details?: string) => {
      showNotification({ type: "error", title, message, details });
    },
    [showNotification]
  );

  const showSuccess = useCallback(
    (title: string, message: string) => {
      showNotification({ type: "success", title, message });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (title: string, message: string) => {
      showNotification({ type: "info", title, message });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (title: string, message: string) => {
      showNotification({ type: "warning", title, message });
    },
    [showNotification]
  );

  // Delete confirmation method
  const showDeleteConfirmation = useCallback(
    (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
      showNotification({
        type: "delete-confirm",
        title,
        message,
        onConfirm,
        onCancel,
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
      });
    },
    [showNotification]
  );

  const handleConfirm = () => {
    if (notification?.onConfirm) {
      notification.onConfirm();
    }
    hideNotification();
  };

  const handleCancel = () => {
    if (notification?.onCancel) {
      notification.onCancel();
    }
    hideNotification();
  };

  const getTypeStyles = (type: NotificationType): StyleOptions => {
    switch (type) {
      case "error":
        return {
          bg: "#ffffff",
          border: "#d32f2f",
          title: "#d32f2f",
          icon: "×",
          iconBg: "#d32f2f",
          iconColor: "#ffffff",
          button: "#d32f2f",
          buttonHover: "#b82727",
          showConfirmCancel: false,
        };
      case "success":
        return {
          bg: "#ffffff",
          border: "#388e3c",
          title: "#388e3c",
          icon: "✓",
          iconBg: "#388e3c",
          iconColor: "#ffffff",
          button: "#388e3c",
          buttonHover: "#307a33",
          showConfirmCancel: false,
        };
      case "info":
        return {
          bg: "#ffffff",
          border: "#0288d1",
          title: "#0288d1",
          icon: "i",
          iconBg: "#0288d1",
          iconColor: "#ffffff",
          button: "#0288d1",
          buttonHover: "#0273b1",
          showConfirmCancel: false,
        };
      case "warning":
        return {
          bg: "#ffffff",
          border: "#f9a825",
          title: "#f9a825",
          icon: "!",
          iconBg: "#f9a825",
          iconColor: "#ffffff",
          button: "#f9a825",
          buttonHover: "#e59311",
          showConfirmCancel: false,
        };
      case "delete-confirm":
        return {
          bg: "#ffffff",
          border: "#d32f2f",
          title: "#d32f2f",
          icon: "!",
          iconBg: "#d32f2f",
          iconColor: "#ffffff",
          button: "#d32f2f",
          buttonHover: "#b82727",
          cancelButton: "#e0e0e0",
          cancelButtonHover: "#c0c0c0",
          cancelTextColor: "#555555",
          showConfirmCancel: true,
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
        showDeleteConfirmation,
      }}
    >
      {children}
      {isOpen &&
        notification &&
        (() => {
          const styles = getTypeStyles(notification.type);

          return (
            <div
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
              onClick={(e) => {
                // Close when clicking the backdrop
                if (e.target === e.currentTarget) {
                  if (styles.showConfirmCancel) {
                    handleCancel();
                  } else {
                    hideNotification();
                  }
                }
              }}
            >
              <div
                className="rounded-md shadow-lg max-w-md w-full mx-4 border-l-4 sm:max-w-xs md:max-w-md"
                style={{
                  backgroundColor: styles.bg,
                  borderLeftColor: styles.border,
                  animation: "fadeIn 0.3s, slideIn 0.3s",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-4 border-b" style={{ borderBottomColor: "#e0e0e0" }}>
                  <h2 className="text-base md:text-lg font-semibold flex items-center" style={{ color: styles.title }}>
                    <span
                      className="h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold mr-3"
                      style={{
                        backgroundColor: styles.iconBg,
                        color: styles.iconColor,
                      }}
                    >
                      {styles.icon}
                    </span>
                    <span className="truncate">{notification.title}</span>
                  </h2>
                  <button
                    onClick={styles.showConfirmCancel ? handleCancel : hideNotification}
                    className="hover:opacity-70 focus:outline-none"
                    style={{ color: "#555555" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <div className="px-6 py-4">
                  <p className="text-xs md:text-sm" style={{ color: "#333333" }}>
                    {notification.message}
                  </p>
                  {notification.details && (
                    <div className="mt-3 p-3 rounded text-xs md:text-sm overflow-auto max-h-40" style={{ backgroundColor: "#f7f7f7" }}>
                      <pre className="whitespace-pre-wrap" style={{ color: "#333333" }}>
                        {notification.details}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="flex justify-end px-6 py-3 border-t" style={{ borderTopColor: "#e0e0e0" }}>
                  {styles.showConfirmCancel ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 rounded text-xs md:text-sm font-medium transition-colors duration-200 focus:outline-none mr-2"
                        style={{
                          backgroundColor: styles.cancelButton || "#e0e0e0",
                          color: styles.cancelTextColor || "#555555",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = styles.cancelButtonHover || "#c0c0c0";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = styles.cancelButton || "#e0e0e0";
                        }}
                      >
                        {notification.cancelLabel || "Cancel"}
                      </button>
                      <button
                        onClick={handleConfirm}
                        className="px-4 py-2 rounded text-xs md:text-sm font-medium transition-colors duration-200 focus:outline-none"
                        style={{
                          backgroundColor: styles.button,
                          color: "#ffffff",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = styles.buttonHover;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = styles.button;
                        }}
                      >
                        {notification.confirmLabel || "Delete"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={hideNotification}
                      className="px-4 py-2 rounded text-xs md:text-sm font-medium transition-colors duration-200 focus:outline-none"
                      style={{
                        backgroundColor: styles.button,
                        color: "#ffffff",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = styles.buttonHover;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = styles.button;
                      }}
                    >
                      {notification.type === "error" ? "Close" : "OK"}
                    </button>
                  )}
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
