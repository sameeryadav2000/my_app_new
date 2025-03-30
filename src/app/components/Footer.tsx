"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";

// Type definitions
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

interface DialogState {
  isOpen: boolean;
  title: string;
  content: string;
}

interface FooterLink {
  title: string;
  id: string;
  content: string;
}

interface ContactFormData {
  email: string;
  phone: string;
  message: string;
}

interface ContactFormErrors {
  email?: string;
  phone?: string;
  message?: string;
}

interface TouchedFields {
  email: boolean;
  phone: boolean;
  message: boolean;
}

// Simplified footer links with updated dialog content
const footerSections: Record<string, FooterLink[]> = {
  Company: [
    {
      title: "About Us",
      id: "about-us",
      content:
        "Ringvio is Nepal's premier marketplace for high-quality refurbished devices. Based in Kathmandu, we're proud to be one of the best places in Nepal to purchase reliable used phones. Our expert technicians thoroughly inspect, clean, and refurbish each device to ensure optimal performance.\n\nWe specialize in restoring smartphones to like-new condition, replacing worn components, updating software, and rigorously testing functionality. By extending the lifecycle of electronics, we're reducing e-waste while providing affordable options for Nepali consumers. Since 2020, we've helped thousands of customers find premium pre-owned devices at a fraction of retail prices.",
    },
    {
      title: "Contact",
      id: "contact",
      content:
        "Email: support@ringvio.com\nPhone: (977) 01-1234567\nHours: Sunday-Friday, 10am-6pm NPT\n\nVisit our store:\nNew Road, Kathmandu\nNepal\n\nFor customer support inquiries, please include your order number in all communications.",
    },
  ],
  Support: [
    {
      title: "Returns",
      id: "returns",
      content:
        "We offer a hassle-free 30-day return policy on all purchases. Items must be returned in the original packaging and in the same condition as received.\n\nAll returned devices include a 6-month warranty from the date of purchase, covering hardware defects and malfunctions. Our warranty does not cover physical damage, water damage, or unauthorized repairs.\n\nPlease note that return shipping fees will be charged to the customer unless the item is defective. A return shipping fee of NPR 500 applies for standard returns.",
    },
    {
      title: "Delivery",
      id: "delivery",
      content:
        "We offer fast and reliable delivery services throughout Nepal. Orders within Kathmandu Valley are typically delivered within 1-2 business days. For locations outside the valley, delivery takes 3-5 business days.\n\nFree delivery is available on all orders above NPR 15,000 within Kathmandu Valley. For orders below NPR 15,000 or outside the valley, shipping charges apply based on location and package weight.\n\nTrack your order anytime through your account dashboard or by contacting our customer service team.",
    },
  ],
};

// Social media icons (unchanged)
const socialLinks = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
];

// Dialog component with responsive design and context integration
const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, content }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    phone: false,
    message: false,
  });

  const [isContactForm, setIsContactForm] = useState(false);

  // Access loading and notification contexts
  const { isLoading, showLoading, hideLoading } = useLoading();
  const { showSuccess, showError } = useNotification();

  // Set contact form state
  useEffect(() => {
    if (title === "Contact") {
      setIsContactForm(true);
    } else {
      setIsContactForm(false);
    }
  }, [title]);

  const validateForm = useCallback(() => {
    const newErrors: ContactFormErrors = {};

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Validate phone - now required
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Phone must contain only numbers";
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [formData]);

  // Validate form on data change
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // For phone field, only allow numeric input
    if (name === "phone" && value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    // Mark field as touched when user changes its value
    if (!touched[name as keyof TouchedFields]) {
      setTouched({
        ...touched,
        [name]: true,
      });
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched on submit
    setTouched({
      email: true,
      phone: true,
      message: true,
    });

    validateForm();

    if (!isFormValid) {
      return;
    }

    // Show loading state
    showLoading();

    try {
      // Make API call to submit form
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        hideLoading();
        showError("Form Submission Error", result.message || "Failed to submit your message. Please try again.");
        return;
      }

      setFormData({
        email: "",
        phone: "",
        message: "",
      });

      setTouched({
        email: false,
        phone: false,
        message: false,
      });

      // Show success notification
      showSuccess("Message Sent", result.message || "Your message has been submitted. We'll get back to you soon!");
      onClose();
    } catch (error) {
      showError(
        "Unexpected Error",
        "An unexpected error occurred while submitting your message.",
        error instanceof Error ? error.message : undefined
      );
    } finally {
      hideLoading();
    }
  };

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} aria-hidden="true"></div>

        {/* Center dialog */}
        <div
          className="relative inline-block overflow-auto text-left bg-white rounded-lg shadow-xl dialog-animation w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto"
          style={{ maxHeight: "80vh" }}
        >
          <div className="flex flex-col">
            <div className="p-3 sm:p-4 md:p-6 bg-white overflow-y-auto">
              <div className="w-full text-center">
                <h3 className="text-lg sm:text-xl font-medium leading-6 text-gray-900 mb-3 sm:mb-4">{title}</h3>

                {isContactForm ? (
                  <div className="mt-4 px-2 sm:px-4 mx-auto">
                    <div className="text-left mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm sm:text-base text-gray-500">
                            <strong>Contact Information:</strong>
                            <br />
                            Email: support@ringvio.com
                            <br />
                            Phone: 2693662076
                            <br />
                            Hours: Sunday-Friday, 10am-6pm NPT
                          </p>
                        </div>
                        <div>
                          <p className="text-sm sm:text-base text-gray-500">
                            <strong>Visit our store:</strong>
                            <br />
                            New Road, Kathmandu
                            <br />
                            Nepal
                            <br />
                            <br />
                            Please include your order number in all communications.
                          </p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-left">
                      <div>
                        <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-[#333333] mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 text-sm border ${
                            touched.email && errors.email ? "border-red-500" : "border-[#e0e0e0]"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200`}
                          placeholder="your@email.com"
                          required
                        />
                        {touched.email && errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-[#333333] mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 text-sm border ${
                            touched.phone && errors.phone ? "border-red-500" : "border-[#e0e0e0]"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200`}
                          placeholder="Enter numbers only"
                          required
                        />
                        {touched.phone && errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-[#333333] mb-1">
                          Message or Feedback
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={3}
                          className={`w-full px-3 py-2 text-sm border ${
                            touched.message && errors.message ? "border-red-500" : "border-[#e0e0e0]"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200`}
                          placeholder="How can we help you?"
                          required
                        />
                        {touched.message && errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`px-4 py-2 text-xs sm:text-sm bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200 order-2 sm:order-1 ${
                            isLoading ? "opacity-75 cursor-not-allowed" : ""
                          }`}
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center">
                              <svg
                                className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Sending...
                            </span>
                          ) : (
                            "Send Message"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-xs sm:text-sm bg-white text-[#666666] border border-[#e0e0e0] rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 order-1 sm:order-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="mt-4 px-2 sm:px-4 mx-auto">
                    <p className="text-sm text-gray-500 whitespace-pre-line max-h-60 overflow-y-auto px-2">{content}</p>
                  </div>
                )}
              </div>
            </div>

            {!isContactForm && (
              <div className="px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 flex justify-center">
                <button
                  type="button"
                  className="inline-flex justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Footer() {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: "",
    content: "",
  });

  const currentYear = new Date().getFullYear();

  const openDialog = (title: string, content: string) => {
    setDialogState({
      isOpen: true,
      title,
      content,
    });
  };

  const closeDialog = () => {
    setDialogState({
      ...dialogState,
      isOpen: false,
    });
  };

  return (
    <>
      <style jsx global>{`
        @keyframes dialogFade {
          from {
            opacity: 0;
            transform: translate3d(0, -30px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .dialog-animation {
          animation: dialogFade 0.3s ease-out forwards;
        }
      `}</style>

      <div className="w-full">
        <footer className="bg-white border-t border-gray-200">
          {/* Main footer section - simplified */}
          <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold tracking-wider text-black">RingVio</span>
                </div>
                <p className="text-gray-600 text-sm max-w-xs">
                  Buying and selling refurbished devices made simple. Quality guaranteed with every purchase.
                </p>
                <div className="flex space-x-5">
                  {socialLinks.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-gray-500 hover:text-black transition-colors duration-200"
                      aria-label={item.name}
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Links sections - now with popup dialogs */}
              {Object.entries(footerSections).map(([section, links]) => (
                <div key={section} className="space-y-4">
                  <h3 className="font-medium text-black text-base">{section}</h3>
                  <ul className="space-y-2">
                    {links.map((link) => (
                      <li key={link.id}>
                        <button
                          onClick={() => openDialog(link.title, link.content)}
                          className="text-gray-600 hover:text-black text-sm transition-colors duration-200 text-left"
                        >
                          {link.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom section with copyright and terms */}
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <p className="text-xs text-gray-500">© {currentYear} RingVio. All rights reserved.</p>
                <div className="flex space-x-6">
                  <button
                    onClick={() =>
                      openDialog(
                        "Privacy Policy",
                        "This privacy policy outlines how RingVio collects, uses, and protects your personal information. We respect your privacy and are committed to maintaining the confidentiality of your personal data.\n\nWe collect basic information necessary to process your orders, including name, address, email, and payment details. Your data is secured using industry-standard encryption protocols and is never shared with unauthorized third parties.\n\nFor complete details about our privacy practices, you may request a copy of our full privacy policy by contacting our customer service team."
                      )
                    }
                    className="text-xs text-gray-500 hover:text-black transition-colors duration-200"
                  >
                    Privacy Policy
                  </button>
                  <button
                    onClick={() =>
                      openDialog(
                        "Terms of Service",
                        "By using the RingVio website and services, you agree to these Terms of Service. These terms outline the rules for using our platform, purchasing policies, and your rights and responsibilities as a user.\n\nAll products sold by RingVio are guaranteed to be fully functional and in the condition described. We verify the authenticity and quality of all devices before listing them for sale.\n\nPayment must be made in full before delivery of any product. We accept various payment methods including cash on delivery within Kathmandu Valley, bank transfers, and digital payment services like eSewa and Khalti."
                      )
                    }
                    className="text-xs text-gray-500 hover:text-black transition-colors duration-200"
                  >
                    Terms of Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Dialog component */}
      <Dialog isOpen={dialogState.isOpen} onClose={closeDialog} title={dialogState.title} content={dialogState.content} />
    </>
  );
}
