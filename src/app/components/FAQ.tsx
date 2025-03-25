"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What does 'refurbished' actually mean?",
    answer:
      "Refurbished products are pre-owned devices that have been professionally restored to full working condition. Each device undergoes our thorough 30-point inspection, with worn or damaged parts replaced with high-quality components. All data is completely wiped, and the device is sanitized before being certified for resale.",
  },
  {
    question: "Are refurbished products reliable?",
    answer:
      "Yes! Our refurbished products undergo rigorous testing and quality control. We only sell devices that meet our strict standards for functionality and appearance. Many customers find that properly refurbished devices are just as reliable as new ones, often lasting for years.",
  },
  {
    question: "What kind of warranty do you offer?",
    answer:
      "All our refurbished products come with a 6-month warranty that covers hardware failures and defects. If your device experiences issues related to our refurbishment process within the warranty period, we'll repair or replace it at no additional cost.",
  },
  {
    question: "How do refurbished products compare to new ones?",
    answer:
      "Refurbished products offer significant savings (typically 30-50% off retail prices) while providing similar functionality to new devices. The main differences may be cosmetic imperfections like minor scratches or signs of wear, which we clearly disclose in our grading system.",
  },
  {
    question: "How do you grade your products?",
    answer:
      "We grade products on a scale from Fair to Excellent. Fair devices function perfectly but may have visible signs of use. Good devices have minor cosmetic imperfections. Very Good devices show minimal signs of use. Excellent devices look nearly new with barely noticeable imperfections.",
  },
  {
    question: "Is buying refurbished actually better for the environment?",
    answer:
      "Absolutely! By extending the lifecycle of electronic devices, you help reduce electronic waste (e-waste) and conserve the resources needed to manufacture new products. The production of a new smartphone generates approximately 60kg of CO2, so buying refurbished significantly reduces your carbon footprint.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full bg-white py-8 md:py-12 lg:py-16">
      <div className="w-[95%] md:w-[70%] mx-auto">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-6 md:mb-8 lg:mb-10">Frequently Asked Questions</h2>

        <div className="space-y-2 md:space-y-3 lg:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <button
                className="w-full px-4 md:px-5 lg:px-6 py-3 md:py-3.5 lg:py-4 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span className="font-medium text-sm md:text-base lg:text-base text-gray-900">{faq.question}</span>
                <svg
                  className={`w-4 h-4 md:w-5 md:h-5 text-gray-500 transition-transform duration-300 ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`px-4 md:px-5 lg:px-6 overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96 py-3 md:py-3.5 lg:py-4 border-t border-gray-200" : "max-h-0"
                }`}
              >
                <p className="text-xs md:text-sm lg:text-base text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
