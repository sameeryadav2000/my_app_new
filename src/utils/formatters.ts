// src/utils/formatters.ts

/**
 * Formats a value as Nepali Rupees (NPR) with proper thousand separators
 * @param amount - The amount to format (can be number, string, or undefined)
 * @param includeCurrency - Whether to include the "NPR" prefix (default: true)
 * @returns Formatted currency string
 */
export const formatNPR = (amount: number | string | undefined, includeCurrency: boolean = true): string => {
  if (amount === undefined || amount === "") return includeCurrency ? "NPR —" : "—";

  // Convert string to number if needed
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Check if it's a valid number after conversion
  if (isNaN(numericAmount)) return includeCurrency ? "NPR —" : "—";

  // Use Intl.NumberFormat with 'en-IN' locale which uses:
  // - Arabic numerals (0, 1, 2, etc.)
  // - Indian/South Asian thousand separators (like 1,00,000 instead of 100,000)
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(numericAmount);

  return includeCurrency ? `NPR ${formattedAmount}` : formattedAmount;
};
